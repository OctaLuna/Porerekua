// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyConfigModule } from '../config/config.module';
import { MyDataBaseConfig } from '../config/services/database.config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [MyConfigModule],
            inject: [MyDataBaseConfig],
            useFactory: (configService: MyDataBaseConfig) => {
                const dbConfig = configService.get();
                return {
                    type: (dbConfig.type ?? 'postgres') as any,
                    host: dbConfig.host ?? undefined,
                    port: dbConfig.port,
                    username: dbConfig.username ?? undefined,
                    password: dbConfig.password ?? undefined,
                    database: dbConfig.database ?? undefined,
                    autoLoadEntities: true,
                    synchronize: false,
                    logging: dbConfig.logging ?? false,
                    // Supabase requires SSL; pooler host contains "supabase"
                    ssl: dbConfig.host?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
                    extra: {
                        max: 5,
                        min: 1,
                        idleTimeoutMillis: 30000,
                    },
                };
            },
        }),
    ],
})
export class MyDatabaseModule { }
