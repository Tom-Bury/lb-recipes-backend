import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('recipes/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('')
  async getAllCategories() {
    return this.categoriesService.getAllNonEmptyCategories();
  }
}
