import {
  ArrayNotEmpty,
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
  @ArrayNotEmpty()
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
  @ArrayNotEmpty()
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
