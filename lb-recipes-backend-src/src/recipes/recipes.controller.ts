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
import { StringQuery } from 'src/validation/interfaces/query.dto';
import { Recipe, RecipeData } from './interfaces/recipe-data.dto';
import { RecipeId } from './interfaces/recipe-id.dto';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  private static TAG = 'RecipesController';

  constructor(private readonly recipesService: RecipesService) {}

  @Get('all/:limit?')
  async getAllRecipes(@Param('limit') limit?: string): Promise<Recipe[]> {
    let parsedLimit: number | undefined;

    if (limit) {
      parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new BadRequestException(`Invalid limit value: '${limit}'`);
      }
    }

    return parsedLimit
      ? this.recipesService.getLastNRecipes(parsedLimit)
      : this.recipesService.getAllRecipes();
  }

  @Get('count')
  async getTotalNbOfRecipes(): Promise<number> {
    return this.recipesService.getTotalNbOfRecipes();
  }

  @Get('recipe/:id')
  async getRecipe(@Param() params: RecipeId): Promise<Recipe> {
    const { id } = params;
    try {
      const data = await this.recipesService.getRecipe(id);
      return data;
    } catch (error) {
      console.error(RecipesController.TAG, error);
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
      console.info(RecipesController.TAG, `Delete recipe ${id}`);
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
      console.info(
        RecipesController.TAG,
        `Update recipe ${id} with ${JSON.stringify(recipeData)}`,
      );
      return this.recipesService.updateRecipe(recipeData, id);
    } else {
      throw new BadRequestException(`No recipe with id '${id}' exists`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  async addRecipe(@Body() recipeData: RecipeData): Promise<{ id: string }> {
    console.info(
      RecipesController.TAG,
      `Add new recipe ${JSON.stringify(recipeData)}`,
    );
    return this.recipesService.addNewRecipe(recipeData);
  }

  @Get('search')
  async searchRecipes(@Query() { query }: StringQuery): Promise<Recipe[]> {
    console.info(RecipesController.TAG, `Search recipe for: ${query}`);
    return this.recipesService.searchRecipes(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preview')
  async getPreviewRecipes(): Promise<Recipe[]> {
    console.info(RecipesController.TAG, `Get preview recipes`);
    return this.recipesService.getPreviewRecipes();
  }
}
