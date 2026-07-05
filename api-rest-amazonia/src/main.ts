import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { buildValidationPipe } from './shared/validation/validation-pipe.config';
import { buildSwaggerConfig } from './shared/swagger/swagger.config';
import { MyServerConfig } from './infrastructure/config/services/server.config';
import { EnviromentEnum } from './shared/enums/enviroment.enum';
import { environmentConfig } from './infrastructure/config/services/enviroment.config';
import { getCorsOptions } from './infrastructure/config/services/cors.config';
import { logServerStatus } from './infrastructure/config/services/logger.config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
	const nodeEnv = process.env.NODE_ENV ?? EnviromentEnum.DEVELOPMENT;
	const isProd = nodeEnv === EnviromentEnum.PRODUCTION;
	const config = environmentConfig[nodeEnv]
	const app = await NestFactory.create(AppModule, {
		logger: config.logger
	});
	app.enableShutdownHooks();
	const myServer = app.get(MyServerConfig).get();

	// AUDIT-004: headers de seguridad (no hay Nginx en PaaS) y ocultar fingerprint.
	// CSP explícita en producción para permitir tiles del mapa y conexiones a Supabase
	// sin bloquear recursos legítimos. En dev se desactiva para que Swagger UI funcione
	// sobre http://localhost sin errores de CSP.
	app.use(helmet({
		contentSecurityPolicy: isProd ? {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", 'data:', 'https:'],
				connectSrc: ["'self'", process.env.SUPABASE_URL ?? '', process.env.GEOREF_URL ?? ''],
				fontSrc: ["'self'", 'https:', 'data:'],
				objectSrc: ["'none'"],
				frameAncestors: ["'none'"],
				upgradeInsecureRequests: [],
			},
		} : false,
	}));
	app.getHttpAdapter().getInstance().disable('x-powered-by');

	// AUDIT-SEC: parsear cookies para extracción de JWT en modo cookie (A02 httpOnly)
	app.use(cookieParser());

	app.setGlobalPrefix('api')

	if (config.swagger) {
		const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
		SwaggerModule.setup('api/documentation', app, document);
	}

	const corsOptions = getCorsOptions(myServer.domainFrontend);
	app.enableCors(corsOptions);

	// AUDIT-002: validación estricta (whitelist + forbidNonWhitelisted).
	app.useGlobalPipes(buildValidationPipe());

	// AUDIT-009: filtro global para que los errores 500 no expongan stack traces.
	app.useGlobalFilters(new HttpExceptionFilter());

	await app.listen(myServer.port);
	logServerStatus(myServer);
}
bootstrap();
