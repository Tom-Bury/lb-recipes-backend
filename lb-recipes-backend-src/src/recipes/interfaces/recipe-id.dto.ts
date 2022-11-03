import { IsNotEmpty, IsString } from 'class-validator';

export class RecipeId {
  @IsNotEmpty()
  @IsString()
  id!: string;
}
