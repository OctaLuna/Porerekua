import { Readable } from 'stream';
import { FormularioMultipartService } from './formulario-multipart.service';
import { MyBadRequestException } from 'src/shared/exceptions';

const multipartRequest = (parts: string) => {
  const boundary = '----porerekua-test-boundary';
  const body = Buffer.from(parts.replaceAll('{boundary}', boundary), 'utf8');
  const request = Readable.from(body) as Readable & {
    headers: Record<string, string>;
  };
  request.headers = {
    'content-type': `multipart/form-data; boundary=${boundary}`,
  };
  return request;
};

describe('FormularioMultipartService', () => {
  it('persists a multipart payload in chunks and preserves the original file metadata', async () => {
    const multimedia = {
      createPending: jest.fn().mockResolvedValue({
        id: 'media-1',
        nombreOriginal: 'impacto.pdf',
        tipoMime: 'application/pdf',
        orden: 0,
      }),
      appendChunk: jest.fn().mockResolvedValue(undefined),
      completePending: jest.fn().mockResolvedValue(undefined),
      discardPending: jest.fn().mockResolvedValue(undefined),
    };
    const service = new FormularioMultipartService(multimedia as never);
    const request = multipartRequest(
      '--{boundary}\r\n' +
        'Content-Disposition: form-data; name="payload"\r\n\r\n' +
        '{"nombre":"Empresa de prueba"}\r\n' +
        '--{boundary}\r\n' +
        'Content-Disposition: form-data; name="multimedia"; filename="impacto.pdf"\r\n' +
        'Content-Type: application/pdf\r\n\r\n' +
        'contenido de prueba\r\n' +
        '--{boundary}--\r\n',
    );

    const result = await service.parse(request as never, (payload) =>
      Promise.resolve(payload as { nombre: string }),
    );

    expect(result.payload).toEqual({ nombre: 'Empresa de prueba' });
    expect(result.multimedia).toEqual([
      {
        id: 'media-1',
        nombreOriginal: 'impacto.pdf',
        tipoMime: 'application/pdf',
        orden: 0,
      },
    ]);
    expect(multimedia.appendChunk).toHaveBeenCalledWith(
      'media-1',
      0,
      Buffer.from('contenido de prueba'),
    );
    expect(multimedia.completePending).toHaveBeenCalledWith(
      'media-1',
      Buffer.byteLength('contenido de prueba'),
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
  });

  it('rejects a file received before the JSON payload and leaves no pending upload', async () => {
    const multimedia = {
      createPending: jest.fn(),
      appendChunk: jest.fn(),
      completePending: jest.fn(),
      discardPending: jest.fn().mockResolvedValue(undefined),
    };
    const service = new FormularioMultipartService(multimedia as never);
    const request = multipartRequest(
      '--{boundary}\r\n' +
        'Content-Disposition: form-data; name="multimedia"; filename="antes.pdf"\r\n' +
        'Content-Type: application/pdf\r\n\r\n' +
        'contenido\r\n' +
        '--{boundary}--\r\n',
    );

    await expect(
      service.parse(request as never, (payload) => Promise.resolve(payload)),
    ).rejects.toBeInstanceOf(MyBadRequestException);
    expect(multimedia.createPending).not.toHaveBeenCalled();
    expect(multimedia.discardPending).toHaveBeenCalledWith([]);
  });
});
