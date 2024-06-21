import {
  IsBoolean,
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
  @IsDataURI()
  blurHash?: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  categories?: string[];

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export class Recipe extends RecipeData {
  @IsNotEmpty()
  @IsString()
  id!: string;
}

export class RecipeWithoutData {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsUrl()
  imgUrl?: string;

  @IsOptional()
  @IsDataURI()
  blurHash?: string;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export const docToRecipeWithoutData = (
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
): RecipeWithoutData => ({
  id: doc.id,
  title: doc.get('title'),
  imgUrl: doc.get('imgUrl') || undefined,
  blurHash: doc.get('blurHash') || undefined,
  isPreview: doc.get('isPreview') || undefined,
});
