import { Controller, Get, Query } from '@nestjs/common';
import { StringArrayQuery } from 'src/validation/interfaces/query.dto';
import { CategoriesService } from './categories.service';

@Controller('recipes/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('')
  async getRecipesForCategories(@Query() { query }: StringArrayQuery) {
    return this.categoriesService.getAllNonEmptyCategories();
  }

  @Get('counts')
  async getCategoryCounts() {
    return this.categoriesService.getAllNonEmptyCategories();
  }
}
