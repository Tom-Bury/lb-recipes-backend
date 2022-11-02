import { Injectable } from '@nestjs/common';
import ogs from 'open-graph-scraper';

@Injectable()
export class PreviewImageService {
  async getPreviewImageForUrl(url: string): Promise<string | undefined> {
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
}
