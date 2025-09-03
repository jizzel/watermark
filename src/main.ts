import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  storageConfig,
  StorageDriver,
} from './app-config/configs/storage.config';
import { DriverConfig } from './modules/storage/storage.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    forceCloseConnections: true,
    abortOnError: false,
  });

  app.enableCors();
  // app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  const config = new DocumentBuilder()
    .setTitle('Watermark API')
    .setVersion('1.0')
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, doc);

  const storageSettings: DriverConfig = app.get(storageConfig.KEY);
  if (storageSettings.driver === StorageDriver.LOCAL) {
    app.useStaticAssets(storageSettings.local.uploadDir, {
      prefix: storageSettings.local.publicRoot,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
