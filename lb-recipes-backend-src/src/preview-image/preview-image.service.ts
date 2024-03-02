import { BadRequestException, Injectable } from '@nestjs/common';
import ogs from 'open-graph-scraper';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { getPlaiceholder } from 'plaiceholder';
import { RecipeData } from 'src/recipes/interfaces/recipe-data.dto';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class PreviewImageService {
  private static TAG = 'PreviewImageService';
  constructor(private readonly firebase: FirebaseService) {}

  async getPreviewImageUrlForUrl(url: string): Promise<string | undefined> {
    const ogsOptions = { url: url.trim(), timeout: 5000 };
    try {
      const { error, result } = await ogs(ogsOptions);

      if (error) {
        throw error;
      }

      return (
        (result?.ogImage as unknown as { url?: string })?.url ||
        (result?.twitterImage as unknown as { url?: string })?.url ||
        undefined
      );
    } catch (error) {
      console.error(`getPreviewImageForUrl scraper error`, error);
      return undefined;
    }
  }

  async getImgBufferForRecipeData(recipeData: RecipeData): Promise<Buffer> {
    const { previewImgFileData, imgUrl, url } = recipeData;
    let imgBuffer;

    if (previewImgFileData) {
      imgBuffer = this.base64ImgURIDataToBuffer(previewImgFileData);
    } else if (imgUrl && imgUrl.length > 0) {
      imgBuffer = await this.imgUrlToImgBuffer(imgUrl);
    } else if (url && url.length > 0) {
      const previewImgUrl = await this.getPreviewImageUrlForUrl(url);
      if (!previewImgUrl || previewImgUrl.length === 0) {
        throw new BadRequestException(
          `No preview image found for given recipe url: ${url}`,
        );
      }
      imgBuffer = await this.imgUrlToImgBuffer(previewImgUrl);
    } else {
      throw new BadRequestException(
        'One of `previewImageFileData`, `url` or `imgUrl` must be specified',
      );
    }

    return imgBuffer;
  }

  async uploadRecipeThumbToStorageBucket(
    recipeData: RecipeData,
    recipeId: string,
  ): Promise<{ previewImgFileName: string; blurHash: string }> {
    console.debug(
      PreviewImageService.TAG,
      'uploadRecipeThumbToStorageBucket START',
      {
        recipeId,
      },
    );
    const imgBuffer = await this.getImgBufferForRecipeData(recipeData);
    const [previewImgBuffer, blurHash] = await Promise.all([
      await this.imgBufferToPreviewImgBuffer(imgBuffer),
      await this.imgBufferToBlurHash(imgBuffer),
    ]);

    const previewImgFileName = `${recipeId}.webp`;

    await this.firebase.uploadFile(
      previewImgBuffer,
      previewImgFileName,
      'lb-recipes-previews-liesbury-recipes-gcp',
    );

    console.debug(
      PreviewImageService.TAG,
      'uploadRecipeThumbToStorageBucket SUCCESS',
      {
        recipeId,
      },
    );
    return {
      previewImgFileName,
      blurHash,
    };
  }

  private base64ImgURIDataToBuffer(imgDataURIData: string): Buffer {
    const base64ImgData = imgDataURIData.split(',')[1];

    if (!base64ImgData || base64ImgData.length === 0)
      throw new Error('Empty img data');

    return Buffer.from(base64ImgData, 'base64');
  }

  private async imgUrlToImgBuffer(imgUrl: string): Promise<Buffer> {
    const res = await fetch(imgUrl);
    const blob = await res.blob();
    return Buffer.from(await blob.arrayBuffer());
  }

  private async imgBufferToPreviewImgBuffer(
    imgBuffer: Buffer,
  ): Promise<Buffer> {
    return await sharp(imgBuffer)
      .resize(1000) // limit width
      .toFormat('webp')
      .toBuffer();
  }

  private async imgBufferToBlurHash(imgBuffer: Buffer): Promise<string> {
    const { base64: blurHash } = await getPlaiceholder(imgBuffer, { size: 64 });
    return blurHash;
  }
}
