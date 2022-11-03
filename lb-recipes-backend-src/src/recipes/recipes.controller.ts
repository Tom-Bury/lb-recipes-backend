import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RecipeData } from './interfaces/recipe-data.dto';
import { Recipe } from './interfaces/recipe.interface';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('recipe/:recipeId')
  getRecipe(@Param('recipeId') recipeId: string) {
    return `recipe ${recipeId}`;
  }

  @Put('recipe/:recipeId')
  updateRecipe() {
    return 'not implemented';
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  async addRecipe(@Body() recipeData: RecipeData) {
    return this.recipesService.addRecipe(recipeData);
  }

  @Get('search')
  async searchRecipes(@Query('query') query?: string): Promise<Recipe[]> {
    if (!query || query.length === 0)
      throw new BadRequestException("Required query parameter 'query' missing");

    return this.recipesService.searchRecipes(query);
  }
}
