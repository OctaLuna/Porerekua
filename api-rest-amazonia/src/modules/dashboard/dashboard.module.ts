import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardPublicoController } from './controllers/dashboard-publico.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
    imports: [AuthModule],
    controllers: [DashboardController, DashboardPublicoController],
    providers: [DashboardService],
})
export class DashboardModule {}
