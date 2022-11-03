import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PreviewImageService } from './preview-image.service';

@Controller('preview-image')
export class PreviewImageController {
  constructor(private readonly previewImageService: PreviewImageService) {}

  @Get('scrape')
  async getPreviewImage(
    @Query('url') url?: string,
  ): Promise<string | undefined> {
    if (!url || url.length === 0)
      throw new BadRequestException("Required query parameter 'url' missing");

    const result = await this.previewImageService.getPreviewImageUrlForUrl(
      decodeURI(url),
    );

    if (result) {
      return result;
    } else {
      throw new NotFoundException(
        `No image url was found for given url '${decodeURI(url)}'`,
      );
    }
  }
}
