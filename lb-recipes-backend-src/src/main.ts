import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Remove any properties from request bodies etc that are not defined in the set types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://recepten.lies.bury.dev',
      'https://recipes.lies.bury.dev',
    ],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    maxAge: 3600,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
