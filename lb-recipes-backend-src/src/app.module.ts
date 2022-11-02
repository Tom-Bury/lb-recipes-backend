import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/configuration';
import { RecipesModule } from './recipes/recipes.module';
import { PreviewImageService } from './preview-image/preview-image.service';
import { PreviewImageModule } from './preview-image/preview-image.module';
import { AuthModule } from './auth/auth.module';

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
  providers: [AppService, PreviewImageService],
})
export class AppModule {}
