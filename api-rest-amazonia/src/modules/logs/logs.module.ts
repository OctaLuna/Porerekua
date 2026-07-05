import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAuditoria } from './entities/log-auditoria.entity';
import { LogsService } from './services/logs.service';
import { LogsController } from './controllers/logs.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([LogAuditoria]),
        forwardRef(() => AuthModule),
    ],
    controllers: [LogsController],
    providers: [LogsService],
    exports: [LogsService],
})
export class LogsModule {}
