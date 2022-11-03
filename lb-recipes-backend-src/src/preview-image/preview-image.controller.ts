import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { GetPreviewImageQuery } from './interfaces/get-preview-image-query.dto';
import { PreviewImageService } from './preview-image.service';

@Controller('preview-image')
export class PreviewImageController {
  constructor(private readonly previewImageService: PreviewImageService) {}

  @Get('scrape')
  async getPreviewImage(
    @Query() query: GetPreviewImageQuery,
  ): Promise<string | undefined> {
    const { url } = query;

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
