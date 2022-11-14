import { Body, Controller, Get, Post } from '@nestjs/common';
import { StringArrayQuery } from 'src/validation/interfaces/query.dto';
import { CategoriesService } from './categories.service';
import { CategoryData } from './interfaces/category-count-response.dto';

@Controller('recipes/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('')
  async getRecipesForCategories(@Body() { query }: StringArrayQuery) {
    return this.categoriesService.getRecipesForCategories(query);
  }

  @Get('counts')
  async getCategoryCounts(): Promise<CategoryData[]> {
    return this.categoriesService.getAllNonEmptyCategories();
  }
}
