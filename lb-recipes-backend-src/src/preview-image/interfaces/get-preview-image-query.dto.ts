import { IsUrl } from 'class-validator';

export class GetPreviewImageQuery {
  @IsUrl()
  url!: string;
}
