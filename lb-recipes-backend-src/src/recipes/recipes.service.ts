import { Injectable } from '@nestjs/common';
import { FieldValue, WriteBatch } from 'firebase-admin/firestore';
import Fuse from 'fuse.js';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PreviewImageService } from 'src/preview-image/preview-image.service';
import { CategoriesService } from './categories/categories.service';
import {
  Recipe,
  RecipeData,
  RecipeWithoutData,
  docToRecipeWithoutData,
} from './interfaces/recipe-data.dto';
import { RecipeIndexEntry } from './interfaces/recipe.interface';
import { byUpdateTimeDescending } from 'src/firebase/firstore.utils';

@Injectable()
export class RecipesService {
  private static TAG = 'RecipesService';

  constructor(
    private readonly firebase: FirebaseService,
    private readonly previewImgService: PreviewImageService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async getAllRecipes(): Promise<RecipeWithoutData[]> {
    try {
      const recipesSnapshot = await this.firebase
        .collection('lb-recipes')
        .get();
      return recipesSnapshot.docs
        .sort(byUpdateTimeDescending)
        .map(docToRecipeWithoutData)
        .filter((recipe) => !recipe?.isPreview);
    } catch (error) {
      console.error(RecipesService.TAG, 'getAllRecipes', error);
      return [];
    }
  }

  async getLastNRecipes(limit: number): Promise<RecipeWithoutData[]> {
    // TODO: create indices for preview and non-preview recipes such that we can query firestore using the limit option
    const allRecipes = await this.getAllRecipes();
    return allRecipes.slice(0, limit);
  }

  async getAllRecipeIds(): Promise<string[]> {
    const recipesSnapshot = await this.firebase.collection('lb-recipes').get();
    return recipesSnapshot.docs.map((doc) => doc.id);
  }

  async getTotalNbOfRecipes(): Promise<number> {
    const snapshot = await this.firebase.collection('lb-recipes').count().get();
    return snapshot.data().count;
  }

  async getRecipe(recipeId: string): Promise<Recipe> {
    const recipeSnapshot = await this.firebase
      .collection('lb-recipes')
      .doc(recipeId)
      .get();

    if (recipeSnapshot.exists) {
      return {
        ...recipeSnapshot.data(),
        id: recipeSnapshot.id,
      } as Recipe;
    } else {
      throw new Error(`Recipe with id '${recipeId}' does not exist`);
    }
  }

  async recipeExists(recipeId: string): Promise<boolean> {
    const recipeSnapshot = await this.firebase
      .collection('lb-recipes')
      .doc(recipeId)
      .get();
    return recipeSnapshot.exists;
  }

  async searchRecipes(query: string): Promise<RecipeWithoutData[]> {
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
      ignoreLocation: true,
      threshold: 0.45,
    });
    const matchingIds = fuse.search(query).map((item) => item.item.recipeId);

    if (matchingIds.length === 0) return [];

    const results = await this.firebase.getAll(
      ...matchingIds.map((id) =>
        this.firebase.collection('lb-recipes').doc(id),
      ),
    );

    return results
      .map(docToRecipeWithoutData)
      .filter((recipe) => !recipe?.isPreview);
  }

  async addNewRecipe(recipeData: RecipeData): Promise<{ id: string }> {
    const newRecipeDocRef = this.firebase.collection('lb-recipes').doc();

    if ((await newRecipeDocRef.get()).exists) {
      throw new Error(
        `Tried creating a recipe with id '${newRecipeDocRef.id}' but one already exists`,
      );
    }

    return this.updateRecipe(recipeData, newRecipeDocRef.id);
  }

  async updateRecipe(
    recipeData: RecipeData,
    recipeId: string,
  ): Promise<{ id: string }> {
    console.debug(RecipesService.TAG, 'updateRecipe START', {
      id: recipeId,
      title: recipeData.title,
    });

    const { previewImgFileName, blurHash } =
      await this.previewImgService.uploadRecipeThumbToStorageBucket(
        recipeData,
        recipeId,
      );

    await this.categoriesService.removeRecipeFromAllCategories(recipeId);

    const sanitizedCategories = recipeData.categories?.map((category) =>
      category.trim().toLowerCase(),
    );

    const writeBatch = this.firebase.batch();
    this.categoriesService.batchWriteRecipeCategories(
      writeBatch,
      recipeId,
      sanitizedCategories,
    );
    this.batchUpdateRecipe(writeBatch, recipeId, {
      ...recipeData,
      categories: sanitizedCategories,
      blurHash,
      previewImgFileName,
      imgUrl: this.firebase.getStorageFileUrl(
        previewImgFileName,
        'lb-recipes-previews-liesbury-recipes-gcp',
      ),
    });

    await writeBatch.commit();

    console.debug(RecipesService.TAG, 'updateRecipe SUCCESS', {
      id: recipeId,
      title: recipeData.title,
    });

    return {
      id: recipeId,
    };
  }

  async deleteRecipe(recipeId: string): Promise<void> {
    const deleteBatch = this.firebase.batch();
    deleteBatch.delete(this.firebase.collection('lb-recipes').doc(recipeId));
    deleteBatch.update(
      this.firebase.collection('lb-recipes-metadata').doc('title-index'),
      {
        [`titles.${recipeId}`]: FieldValue.delete(),
      },
    );
    await this.categoriesService.batchRemoveRecipeFromAllCategories(
      deleteBatch,
      recipeId,
    );

    const previewImgFileDeletionPromise =
      this.firebase.deleteAllFilesWithPrefix(
        recipeId,
        'lb-recipes-previews-liesbury-recipes-gcp',
      );

    await Promise.all([deleteBatch.commit(), previewImgFileDeletionPromise]);
  }

  private batchUpdateRecipe(
    writeBatch: WriteBatch,
    recipeId: string,
    recipeData: RecipeData & { blurHash: string; previewImgFileName: string },
  ): void {
    const {
      title,
      url,
      imgUrl,
      previewImgFileName,
      ingredients,
      instructions,
      tips,
      categories,
      blurHash,
      isPreview,
    } = recipeData;
    writeBatch.set(this.firebase.collection('lb-recipes').doc(recipeId), {
      title,
      url,
      imgUrl,
      previewImgFileName,
      ingredients,
      instructions,
      tips,
      blurHash,
      isPreview: Boolean(isPreview),
      categories: categories?.map((category) => category.trim().toLowerCase()),
    });
    const indexMapField = `titles.${recipeId}`;
    writeBatch.update(
      this.firebase.collection('lb-recipes-metadata').doc('title-index'),
      {
        [indexMapField]: {
          title,
          recipeId,
        },
      },
    );
  }

  async getPreviewRecipes(): Promise<RecipeWithoutData[]> {
    const previewRecipesSnapshot = await this.firebase
      .collection('lb-recipes')
      .where('isPreview', '==', true)
      .get();

    return previewRecipesSnapshot.docs.map(docToRecipeWithoutData);
  }
}
