import { Module } from '@nestjs/common';
import { PreviewImageController } from './preview-image.controller';
import { PreviewImageService } from './preview-image.service';

@Module({
  controllers: [PreviewImageController],
  providers: [PreviewImageService],
})
export class PreviewImageModule {}
