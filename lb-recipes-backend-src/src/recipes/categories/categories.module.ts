import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, FirebaseService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
