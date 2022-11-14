import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PreviewImageController } from './preview-image.controller';
import { PreviewImageService } from './preview-image.service';

@Module({
  controllers: [PreviewImageController],
  providers: [PreviewImageService, FirebaseService],
  exports: [PreviewImageService],
})
export class PreviewImageModule {}
