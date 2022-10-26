import { Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Recipe } from './interfaces/recipe.interface';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('recipe/:recipeId')
  getRecipe(@Param('recipeId') recipeId: string) {
    return `recipe ${recipeId}`;
  }

  @Post('recipe')
  addRecipe() {
    return 'not implemented';
  }

  @Put('recipe')
  updateRecipe() {
    return 'not implemented';
  }

  @Get('search')
  async searchRecipes(@Query('query') query?: string): Promise<Recipe[]> {
    if (!query) return [];

    return this.recipesService.searchRecipes(query);
  }
}
