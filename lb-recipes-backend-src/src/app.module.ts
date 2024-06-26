import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/configuration';
import { RecipesModule } from './recipes/recipes.module';
import { PreviewImageModule } from './preview-image/preview-image.module';
import { AuthModule } from './auth/auth.module';
import { JsonBodyParserMiddleware } from './middleware/json-body-parser.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      envFilePath: '../.env',
      isGlobal: true,
    }),
    RecipesModule,
    PreviewImageModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(middlewareConsumer: MiddlewareConsumer): void {
    middlewareConsumer.apply(LoggerMiddleware).forRoutes('*');
    middlewareConsumer.apply(JsonBodyParserMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
