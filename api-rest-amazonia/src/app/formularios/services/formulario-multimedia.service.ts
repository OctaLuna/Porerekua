import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { FormularioMultimedia } from '../entities/formulario-multimedia.entity';
import { FormularioMultimediaFragmento } from '../entities/formulario-multimedia-fragmento.entity';
import { MyBadRequestException } from 'src/shared/exceptions';

export const FORMULARIO_MULTIMEDIA_MAX_BYTES = 500 * 1024 * 1024;
export const FORMULARIO_MULTIMEDIA_MAX_FILES = 20;
export const FORMULARIO_MULTIMEDIA_CHUNK_BYTES = 1024 * 1024;

export interface MultimediaPendienteInput {
  nombreOriginal: string;
  tipoMime: string;
  orden: number;
}

export interface MultimediaPendiente {
  id: string;
  nombreOriginal: string;
  tipoMime: string;
  orden: number;
}

@Injectable()
export class FormularioMultimediaService {
  constructor(private readonly dataSource: DataSource) {}

  async createPending(
    input: MultimediaPendienteInput,
  ): Promise<MultimediaPendiente> {
    const multimedia = await this.dataSource
      .getRepository(FormularioMultimedia)
      .save({
        ...input,
        tamanoBytes: '0',
        checksumSha256: null,
        autorizaPublicacion: false,
        estado: 'pendiente',
        idEmpresa: null,
        idOrganizacion: null,
      });

    return {
      id: multimedia.id,
      nombreOriginal: multimedia.nombreOriginal,
      tipoMime: multimedia.tipoMime,
      orden: multimedia.orden,
    };
  }

  async appendChunk(
    idMultimedia: string,
    numero: number,
    contenido: Buffer,
  ): Promise<void> {
    if (
      !contenido.length ||
      contenido.length > FORMULARIO_MULTIMEDIA_CHUNK_BYTES
    ) {
      throw new MyBadRequestException('Fragmento multimedia inválido');
    }

    await this.dataSource.getRepository(FormularioMultimediaFragmento).insert({
      idMultimedia,
      numero,
      contenido,
    });
  }

  async completePending(
    idMultimedia: string,
    tamanoBytes: number,
    checksumSha256: string,
  ): Promise<void> {
    if (
      !Number.isSafeInteger(tamanoBytes) ||
      tamanoBytes < 1 ||
      tamanoBytes > FORMULARIO_MULTIMEDIA_MAX_BYTES
    ) {
      throw new MyBadRequestException(
        'El tamaño del archivo multimedia no es válido',
      );
    }

    const result = await this.dataSource
      .getRepository(FormularioMultimedia)
      .update(
        { id: idMultimedia, estado: 'pendiente' },
        { tamanoBytes: String(tamanoBytes), checksumSha256 },
      );
    if (result.affected !== 1) {
      throw new MyBadRequestException(
        'No se pudo completar la carga multimedia',
      );
    }
  }

  async attachPendingToEmpresa(
    multimediaIds: string[],
    idEmpresa: number,
    autorizaPublicacion: boolean,
    manager: EntityManager,
  ): Promise<void> {
    await this.attachPending(
      multimediaIds,
      { idEmpresa, idOrganizacion: null },
      autorizaPublicacion,
      manager,
    );
  }

  async attachPendingToOrganizacion(
    multimediaIds: string[],
    idOrganizacion: number,
    autorizaPublicacion: boolean,
    manager: EntityManager,
  ): Promise<void> {
    await this.attachPending(
      multimediaIds,
      { idEmpresa: null, idOrganizacion },
      autorizaPublicacion,
      manager,
    );
  }

  async discardPending(multimediaIds: string[]): Promise<void> {
    if (!multimediaIds.length) return;
    await this.dataSource.getRepository(FormularioMultimedia).delete({
      id: In(multimediaIds),
      estado: 'pendiente',
    });
  }

  private async attachPending(
    multimediaIds: string[],
    owner: Pick<FormularioMultimedia, 'idEmpresa' | 'idOrganizacion'>,
    autorizaPublicacion: boolean,
    manager: EntityManager,
  ): Promise<void> {
    if (!multimediaIds.length) return;

    const result = await manager.getRepository(FormularioMultimedia).update(
      { id: In(multimediaIds), estado: 'pendiente' },
      {
        ...owner,
        autorizaPublicacion,
        estado: 'adjunto',
      },
    );
    if (result.affected !== multimediaIds.length) {
      throw new MyBadRequestException(
        'La carga multimedia ya no está disponible',
      );
    }
  }
}
