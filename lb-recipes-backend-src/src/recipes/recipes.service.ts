import { Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import Fuse from 'fuse.js';
import { FirebaseService } from 'src/firebase/firebase.service';
import { Recipe, RecipeIndexEntry } from './interfaces/recipe.interface';

@Injectable()
export class RecipesService {
  MAX_NB_SEARCH_ITEMS = 10;

  constructor(private firebase: FirebaseService) {}

  async searchRecipes(query: string): Promise<Recipe[]> {
    const recipesTitleIndex = await this.firebase
      .collection('lb-recipes-metadata')
      .doc('title-index')
      .get();

    if (!recipesTitleIndex.exists) {
      throw new Error('Recipes index not found');
    }

    const allRecipes: RecipeIndexEntry[] = Object.values(
      recipesTitleIndex.data()?.titles,
    );

    const fuse = new Fuse(allRecipes, {
      keys: ['title'],
    });
    const matchingIds = fuse.search(query).map((item) => item.item.recipeId);

    if (matchingIds.length === 0) return [];

    const searchForIds = [];
    while (
      matchingIds.length > 0 &&
      searchForIds.length < this.MAX_NB_SEARCH_ITEMS
    ) {
      searchForIds.push(matchingIds.shift());
    }

    const results = await this.firebase
      .collection('lb-recipes')
      .where(firestore.FieldPath.documentId(), 'in', searchForIds)
      .get();

    return results.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  }
}
