import { Injectable } from '@nestjs/common';
import ogs from 'open-graph-scraper';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { getPlaiceholder } from 'plaiceholder';

@Injectable()
export class PreviewImageService {
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

  base64ImgURIDataToBuffer(imgDataURIData: string): Buffer {
    const base64ImgData = imgDataURIData.split(',')[1];

    if (!base64ImgData || base64ImgData.length === 0)
      throw new Error('Empty img data');

    return Buffer.from(base64ImgData, 'base64');
  }

  async imgUrlToImgBuffer(imgUrl: string): Promise<Buffer> {
    const res = await fetch(imgUrl);
    const blob = await res.blob();
    return Buffer.from(await blob.arrayBuffer());
  }

  async imgBufferToPreviewImgBuffer(imgBuffer: Buffer): Promise<Buffer> {
    return await sharp(imgBuffer)
      .resize(1000) // limit width
      .toFormat('webp')
      .toBuffer();
  }

  async imgBufferToBlurHash(imgBuffer: Buffer): Promise<string> {
    const { base64: blurHash } = await getPlaiceholder(imgBuffer, { size: 64 });
    return blurHash;
  }
}
