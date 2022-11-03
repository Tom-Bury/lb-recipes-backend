import { IsNotEmpty, IsString } from 'class-validator';

export class SearchRecipeQuery {
  @IsNotEmpty()
  @IsString()
  query!: string;
}
