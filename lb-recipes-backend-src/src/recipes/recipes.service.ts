import { BadRequestException, Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Fuse from 'fuse.js';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PreviewImageService } from 'src/preview-image/preview-image.service';
import { Recipe, RecipeData } from './interfaces/recipe-data.dto';
import { RecipeIndexEntry } from './interfaces/recipe.interface';

@Injectable()
export class RecipesService {
  MAX_NB_SEARCH_ITEMS = 10;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly previewImgService: PreviewImageService,
  ) {}

  async getRecipe(recipeId: string): Promise<Recipe> {
    const recipeSnapshot = await this.firebase
      .collection('lb-recipes')
      .doc(recipeId)
      .get();

    if (recipeSnapshot.exists) {
      return recipeSnapshot.data() as Recipe;
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
    })) as Recipe[];
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
    const { title, url, ingredients, instructions, tips } = recipeData;
    const recipeDocRef = this.firebase.collection('lb-recipes').doc(recipeId);

    const imgBuffer = await this.getImgBufferForRecipeData(recipeData);
    const [previewImgBuffer, blurHash] = await Promise.all([
      await this.previewImgService.imgBufferToPreviewImgBuffer(imgBuffer),
      await this.previewImgService.imgBufferToBlurHash(imgBuffer),
    ]);

    const previewImgFileName = `${recipeId}.webp`;

    await this.firebase.uploadFile(
      previewImgBuffer,
      previewImgFileName,
      'lb_recipes_previews-liesbury-recipes-322314',
    );

    const recipesDocPromise = recipeDocRef.set({
      title,
      url,
      imgUrl: this.firebase.getStorageFileUrl(
        previewImgFileName,
        'lb_recipes_previews-liesbury-recipes-322314',
      ),
      previewImgFileName,
      ingredients,
      instructions,
      tips,
      blurHash,
    });

    const recipesIndexRef = this.firebase
      .collection('lb-recipes-metadata')
      .doc('title-index');
    const indexMapField = `titles.${recipeId}`;
    const recipesIndexPromise = recipesIndexRef.update({
      [indexMapField]: {
        title,
        recipeId,
      },
    });

    await Promise.all([recipesDocPromise, recipesIndexPromise]);

    return {
      id: recipeId,
    };
  }

  async deleteRecipe(recipeId: string): Promise<void> {
    const recipeDocDeletionPromise = this.firebase
      .collection('lb-recipes')
      .doc(recipeId)
      .delete();

    const recipesIndexRef = this.firebase
      .collection('lb-recipes-metadata')
      .doc('title-index');
    const indexMapField = `titles.${recipeId}`;
    const recipesIndexUpdatePromise = recipesIndexRef.update({
      [indexMapField]: FieldValue.delete(),
    });

    const previewImgFileDeletionPromise =
      this.firebase.deleteAllFilesWithPrefix(
        recipeId,
        'lb_recipes_previews-liesbury-recipes-322314',
      );

    await Promise.all([
      recipeDocDeletionPromise,
      recipesIndexUpdatePromise,
      previewImgFileDeletionPromise,
    ]);
  }

  private async getImgBufferForRecipeData(
    recipeData: RecipeData,
  ): Promise<Buffer> {
    const { previewImgFileData, imgUrl, url } = recipeData;
    let imgBuffer;

    if (previewImgFileData) {
      imgBuffer =
        this.previewImgService.base64ImgURIDataToBuffer(previewImgFileData);
    } else if (imgUrl && imgUrl.length > 0) {
      imgBuffer = await this.previewImgService.imgUrlToImgBuffer(imgUrl);
    } else if (url && url.length > 0) {
      const previewImgUrl =
        await this.previewImgService.getPreviewImageUrlForUrl(url);
      if (!previewImgUrl || previewImgUrl.length === 0) {
        throw new BadRequestException(
          `No preview image found for given recipe url: ${url}`,
        );
      }
      imgBuffer = await this.previewImgService.imgUrlToImgBuffer(previewImgUrl);
    } else {
      throw new BadRequestException(
        'One of `previewImageFileData`, `url` or `imgUrl` must be specified',
      );
    }

    return imgBuffer;
  }
}
