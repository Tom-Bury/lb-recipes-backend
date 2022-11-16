import {
  IsDataURI,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class RecipeData {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsUrl()
  imgUrl?: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  ingredients?: string[];

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  tips?: string;

  @IsOptional()
  @IsDataURI()
  previewImgFileData?: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  categories?: string[];
}

export class Recipe extends RecipeData {
  @IsNotEmpty()
  @IsString()
  id!: string;
}
