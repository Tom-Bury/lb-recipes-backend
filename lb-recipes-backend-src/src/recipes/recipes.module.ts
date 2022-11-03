import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PreviewImageService } from 'src/preview-image/preview-image.service';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  controllers: [RecipesController],
  providers: [FirebaseService, RecipesService, PreviewImageService],
})
export class RecipesModule {}
