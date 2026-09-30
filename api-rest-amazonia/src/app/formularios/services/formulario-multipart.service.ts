import { Injectable } from '@nestjs/common';
/* Busboy publica `export =`; esta sintaxis conserva la importación CommonJS
 * correcta con la configuración actual de TypeScript. */
/* eslint-disable-next-line @typescript-eslint/no-require-imports */
import Busboy = require('busboy');
import { createHash } from 'crypto';
import { Request } from 'express';
import { basename } from 'path';
import { MyBadRequestException } from 'src/shared/exceptions';
import {
  FORMULARIO_MULTIMEDIA_CHUNK_BYTES,
  FORMULARIO_MULTIMEDIA_MAX_BYTES,
  FORMULARIO_MULTIMEDIA_MAX_FILES,
  FormularioMultimediaService,
  MultimediaPendiente,
} from './formulario-multimedia.service';

export interface MultipartFormulario<T> {
  payload: T;
  multimedia: MultimediaPendiente[];
}

/**
 * Procesa multipart sin acumular archivos en memoria. Cada MiB confirmado se
 * persiste como bytea; así el límite de 500 MiB es agregado y no por archivo.
 */
@Injectable()
export class FormularioMultipartService {
  constructor(
    private readonly multimediaService: FormularioMultimediaService,
  ) {}

  async parse<T>(
    request: Request,
    validatePayload: (payload: unknown) => Promise<T>,
  ): Promise<MultipartFormulario<T>> {
    const contentType = request.headers['content-type'];
    if (!contentType?.toLowerCase().includes('multipart/form-data')) {
      throw new MyBadRequestException(
        'El formulario multimedia debe enviarse como multipart/form-data',
      );
    }

    return new Promise<MultipartFormulario<T>>((resolve, reject) => {
      let payloadPromise: Promise<T> | null = null;
      let payloadReceived = false;
      let fileStarted = false;
      let totalBytes = 0;
      let nextFileOrder = 0;
      let firstError: Error | null = null;
      const multimedia: MultimediaPendiente[] = [];
      const uploads: Promise<void>[] = [];

      const fail = (error: unknown) => {
        if (!firstError) {
          firstError =
            error instanceof Error
              ? error
              : new Error('No se pudo procesar la carga multimedia');
        }
      };

      let parser: Busboy.Busboy;
      try {
        parser = Busboy({
          headers: request.headers,
          limits: {
            fieldSize: 1024 * 1024,
            fields: 1,
            files: FORMULARIO_MULTIMEDIA_MAX_FILES,
            parts: FORMULARIO_MULTIMEDIA_MAX_FILES + 1,
            fileSize: FORMULARIO_MULTIMEDIA_MAX_BYTES,
          },
        });
      } catch {
        reject(new MyBadRequestException('Solicitud multipart inválida'));
        return;
      }

      parser.on('field', (name, value) => {
        if (firstError) return;
        if (name !== 'payload' || payloadReceived || fileStarted) {
          fail(
            new MyBadRequestException(
              'La solicitud solo admite un campo payload antes de los archivos',
            ),
          );
          return;
        }

        payloadReceived = true;
        payloadPromise = (async () => {
          try {
            return await validatePayload(JSON.parse(value));
          } catch (error) {
            if (error instanceof Error) throw error;
            throw new MyBadRequestException(
              'Los datos del formulario no son válidos',
            );
          }
        })();
        payloadPromise.catch(fail);
      });

      parser.on('file', (name, file, info) => {
        fileStarted = true;
        if (firstError) {
          file.resume();
          return;
        }
        const upload = this.storeFile(
          name,
          file,
          info,
          nextFileOrder++,
          () => payloadPromise,
          (size) => {
            totalBytes += size;
            return totalBytes;
          },
        )
          .then((pending) => {
            multimedia.push(pending);
          })
          .catch((error) => fail(error));
        uploads.push(upload);
      });

      parser.on('filesLimit', () =>
        fail(
          new MyBadRequestException(
            `Solo se permiten hasta ${FORMULARIO_MULTIMEDIA_MAX_FILES} archivos`,
          ),
        ),
      );
      parser.on('fieldsLimit', () =>
        fail(
          new MyBadRequestException('La solicitud contiene demasiados campos'),
        ),
      );
      parser.on('partsLimit', () =>
        fail(
          new MyBadRequestException('La solicitud contiene demasiadas partes'),
        ),
      );
      parser.on('error', fail);
      parser.on('finish', () => {
        void (async () => {
          await Promise.all(uploads);
          try {
            if (firstError) throw firstError;
            if (!payloadPromise)
              throw new MyBadRequestException(
                'Falta el campo payload del formulario',
              );
            const payload = await payloadPromise;
            resolve({
              payload,
              multimedia: multimedia.sort((a, b) => a.orden - b.orden),
            });
          } catch (error) {
            await this.multimediaService.discardPending(
              multimedia.map((item) => item.id),
            );
            reject(
              error instanceof Error
                ? error
                : new Error('No se pudo procesar la carga multimedia'),
            );
          }
        })();
      });

      request.pipe(parser);
    });
  }

  private async storeFile(
    fieldName: string,
    file: NodeJS.ReadableStream,
    info: { filename: string; mimeType: string },
    orden: number,
    getPayload: () => Promise<unknown> | null,
    addTotalBytes: (size: number) => number,
  ): Promise<MultimediaPendiente> {
    if (fieldName !== 'multimedia') {
      for await (const chunk of file) {
        void chunk;
      }
      throw new MyBadRequestException(
        'El campo de archivos debe llamarse multimedia',
      );
    }
    if (!getPayload()) {
      for await (const chunk of file) {
        void chunk;
      }
      throw new MyBadRequestException(
        'El campo payload debe enviarse antes de los archivos',
      );
    }

    // Espera la validación del JSON antes de crear registros temporales.
    // Si falla, consume la parte actual para que Busboy pueda cerrar limpio.
    try {
      await getPayload();
    } catch (error) {
      for await (const chunk of file) {
        void chunk;
      }
      throw error;
    }

    let pending: MultimediaPendiente;
    try {
      pending = await this.multimediaService.createPending({
        nombreOriginal: this.safeFilename(info.filename),
        tipoMime: this.safeMimeType(info.mimeType),
        orden,
      });
    } catch (error) {
      for await (const chunk of file) {
        void chunk;
      }
      throw error;
    }

    const hash = createHash('sha256');
    let fileBytes = 0;
    let chunkNumber = 0;
    let buffered: Buffer[] = [];
    let bufferedBytes = 0;
    let exceedsTotalLimit = false;

    const flush = async (size = bufferedBytes) => {
      if (!size) return;
      const bufferedData = Buffer.concat(buffered, bufferedBytes);
      const chunk = bufferedData.subarray(0, size);
      const remaining = bufferedData.subarray(size);
      buffered = remaining.length ? [remaining] : [];
      bufferedBytes = remaining.length;
      await this.multimediaService.appendChunk(
        pending.id,
        chunkNumber++,
        chunk,
      );
    };

    try {
      for await (const received of file) {
        const data = Buffer.isBuffer(received)
          ? received
          : Buffer.from(received);
        fileBytes += data.length;
        if (addTotalBytes(data.length) > FORMULARIO_MULTIMEDIA_MAX_BYTES) {
          // Seguir consumiendo hasta el final permite devolver un 400 legible
          // y libera el parser sin guardar bytes adicionales.
          exceedsTotalLimit = true;
          continue;
        }
        if (exceedsTotalLimit) continue;
        hash.update(data);
        buffered.push(data);
        bufferedBytes += data.length;
        while (bufferedBytes >= FORMULARIO_MULTIMEDIA_CHUNK_BYTES) {
          await flush(FORMULARIO_MULTIMEDIA_CHUNK_BYTES);
        }
      }

      if (exceedsTotalLimit)
        throw new MyBadRequestException(
          'El total de archivos no puede superar 500 MiB',
        );
      if (!fileBytes)
        throw new MyBadRequestException('No se permiten archivos vacíos');
      await flush();
      await this.multimediaService.completePending(
        pending.id,
        fileBytes,
        hash.digest('hex'),
      );
      return pending;
    } catch (error) {
      await this.multimediaService.discardPending([pending.id]);
      throw error;
    }
  }

  private safeFilename(filename: string): string {
    const safe = Array.from(basename(filename || 'archivo'))
      .map((character) =>
        character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character)
          ? '_'
          : character,
      )
      .join('')
      .trim();
    return (safe || 'archivo').slice(0, 255);
  }

  private safeMimeType(mimeType: string): string {
    return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(mimeType)
      ? mimeType.toLowerCase().slice(0, 255)
      : 'application/octet-stream';
  }
}
