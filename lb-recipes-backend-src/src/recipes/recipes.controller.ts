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
import { SearchRecipeQuery } from './interfaces/search-recipe-query.dto';
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

  @UseGuards(JwtAuthGuard)
  @Delete('recipe/:id')
  async deleteRecipe(@Param() params: RecipeId): Promise<string> {
    const { id } = params;
    if (await this.recipesService.recipeExists(id)) {
      console.info(`Delete recipe ${id}`);
      await this.recipesService.deleteRecipe(id);
      return `Successfully deleted recipe data for id '${id}'`;
    } else {
      throw new BadRequestException(`No recipe with id '${id}' exists`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('recipe/:id')
  async updateRecipe(
    @Body() recipeData: RecipeData,
    @Param() params: RecipeId,
  ): Promise<{ id: string }> {
    const { id } = params;
    if (await this.recipesService.recipeExists(id)) {
      console.info(`Update recipe ${id} with ${JSON.stringify(recipeData)}`);
      return this.recipesService.updateRecipe(recipeData, id);
    } else {
      throw new BadRequestException(`No recipe with id '${id}' exists`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  async addRecipe(@Body() recipeData: RecipeData): Promise<{ id: string }> {
    console.info(`Add new recipe ${JSON.stringify(recipeData)}`);
    return this.recipesService.addNewRecipe(recipeData);
  }

  @Get('search')
  async searchRecipes(
    @Query() queryParams: SearchRecipeQuery,
  ): Promise<Recipe[]> {
    const { query } = queryParams;
    console.info(`Search recipe for: ${query}`);
    return this.recipesService.searchRecipes(query);
  }
}
