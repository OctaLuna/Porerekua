import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join, resolve, sep } from 'path';
import sharp from 'sharp';
import { MyBadRequestException } from '../exceptions';

@Injectable()
export class UploadService {
    constructor(private readonly configService: ConfigService) {}

    private get basePath(): string {
        return this.configService.get<string>('UPLOADS_PATH') ?? './uploads';
    }

    private get baseUrl(): string {
        return this.configService.get<string>('UPLOADS_BASE_URL') ?? 'http://localhost:3333/uploads';
    }

    async saveImage(
        buffer: Buffer,
        subdir: string,
        maxWidth: number,
        maxHeight: number,
    ): Promise<{ url: string; path: string }> {
        const uuid = randomUUID();
        const relativePath = `${subdir}/${uuid}.webp`;
        const absoluteDir = join(process.cwd(), this.basePath, subdir);
        const absolutePath = join(process.cwd(), this.basePath, relativePath);

        await fs.mkdir(absoluteDir, { recursive: true });

        try {
            await sharp(buffer)
                .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(absolutePath);
        } catch {
            throw new MyBadRequestException('El archivo no es una imagen válida o está corrupto');
        }

        return {
            path: relativePath,
            url: `${this.baseUrl}/${relativePath}`,
        };
    }

    async deleteImage(relativePath: string): Promise<void> {
        if (!relativePath) return;
        const uploadsRoot = resolve(process.cwd(), this.basePath);
        const absolutePath = resolve(uploadsRoot, relativePath);
        // Prevenir path traversal: el path resuelto debe estar dentro de uploadsRoot
        if (!absolutePath.startsWith(uploadsRoot + sep) && absolutePath !== uploadsRoot) {
            return;
        }
        await fs.unlink(absolutePath).catch(() => {
            // silently ignore if file doesn't exist
        });
    }
}
