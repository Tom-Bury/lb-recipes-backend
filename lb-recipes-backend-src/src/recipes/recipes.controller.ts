import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { getErrorMessage } from 'src/utils/error.utils';
import { Recipe, RecipeData } from './interfaces/recipe-data.dto';
import { RecipeId } from './interfaces/recipe-id.dto';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('recipe/:id')
  async getRecipe(@Param() params: RecipeId): Promise<Recipe> {
    const { id } = params;
    try {
      const data = await this.recipesService.getRecipe(id);
      return data;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        `Recipe with id '${id}' not found. Reason: ${getErrorMessage(error)}`,
      );
    }
  }

  @Put('recipe/:recipeId')
  updateRecipe() {
    return 'not implemented';
  }

  @UseGuards(JwtAuthGuard)
  @Delete('recipe/:id')
  async deleteRecipe(@Param() params: RecipeId) {
    const { id } = params;
    if (await this.recipesService.recipeExists(id)) {
      await this.recipesService.deleteRecipe(id);
      return `Successfully deleted recipe data for id '${id}'`;
    } else {
      throw new BadRequestException(`No recipe with id '${id}' exists`);
    }
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
