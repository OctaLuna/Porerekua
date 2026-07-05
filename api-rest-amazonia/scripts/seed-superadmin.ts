import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { Usuario } from '../src/modules/auth/entities/usuario.entity';
import { SolicitudAcceso } from '../src/modules/auth/entities/solicitud-acceso.entity';
import { hashPassword } from '../src/shared/utils/crypto.util';
import { RoleEnum } from '../src/shared/enums/role.enum';

async function main() {
    const email = process.env.SEED_SUPERADMIN_EMAIL;
    const password = process.env.SEED_SUPERADMIN_PASSWORD;

    if (!email || !password) {
        console.error('ERROR: Define SEED_SUPERADMIN_EMAIL y SEED_SUPERADMIN_PASSWORD en .env');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('ERROR: SEED_SUPERADMIN_PASSWORD debe tener al menos 8 caracteres');
        process.exit(1);
    }

    const ds = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Usuario, SolicitudAcceso],
        synchronize: false,
    });

    await ds.initialize();
    const repo = ds.getRepository(Usuario);

    const existente = await repo.findOne({ where: { email } });
    if (existente) {
        console.log(`INFO: Ya existe un usuario con email "${email}". No se creó nada.`);
        await ds.destroy();
        process.exit(0);
    }

    const passwordHash = await hashPassword(password);
    const superadmin = repo.create({
        email,
        passwordHash,
        nombre: 'Superadmin',
        rol: RoleEnum.Superadmin,
        activo: true,
        fechaExpiracion: null,
    });

    await repo.save(superadmin);
    console.log(`OK: Superadmin creado con email "${email}"`);
    await ds.destroy();
}

main().catch((err) => {
    console.error('ERROR:', err);
    process.exit(1);
});
