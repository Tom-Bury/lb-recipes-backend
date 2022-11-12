import { Injectable } from '@nestjs/common';
import { WriteBatch } from 'firebase-admin/firestore';
import { FirebaseService } from 'src/firebase/firebase.service';
import { nonNullable } from 'src/validation/typeValidation.utils';
import { Recipe } from '../interfaces/recipe-data.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly firebase: FirebaseService) {}

  async getAllNonEmptyCategories(): Promise<
    {
      categoryId: string;
      nbEntries: number;
    }[]
  > {
    const allCategories = (
      await this.firebase
        .collection('lb-recipes-categories')
        .where('nbEntries', '>', 0)
        .get()
    ).docs.map((doc) => ({
      categoryId: doc.id,
      ...(doc.data() as { nbEntries: number }),
    }));

    return allCategories;
  }

  async getRecipesForCategories(categories: string[]): Promise<Recipe[]> {
    const categoryRecipeIdsLists = await Promise.all(
      categories.map(
        (category) =>
          new Promise<Set<string>>((resolve) => {
            this.firebase
              .collection('lb-recipes-categories')
              .doc(category)
              .collection('entries')
              .get()
              .then((result) => new Set(result.docs.map((doc) => doc.id)))
              .then((ids) => resolve(ids));
          }),
      ),
    );

    const intersectingIds = [
      ...categoryRecipeIdsLists.reduce(
        (prev, curr) =>
          new Set([...prev].filter((element) => curr.has(element))),
        new Set(),
      ),
    ];

    if (intersectingIds.length === 0) return [];

    const results = await this.firebase.getAll(
      ...intersectingIds.map((id) =>
        this.firebase.collection('lb-recipes').doc(id),
      ),
    );

    return results.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Recipe[];
  }

  async removeRecipeFromAllCategories(recipeId: string): Promise<void> {
    const batch = this.firebase.batch();
    await this.batchRemoveRecipeFromAllCategories(batch, recipeId);
    await batch.commit();
  }

  async batchRemoveRecipeFromAllCategories(
    writeBatch: WriteBatch,
    recipeId: string,
  ): Promise<void> {
    const categoriesCol = this.firebase.collection('lb-recipes-categories');
    const allCategories = (await categoriesCol.get()).docs.map((doc) => doc.id);

    const categoriesContainingRecipe = (
      await Promise.all(
        allCategories.map(
          (category) =>
            new Promise<string | undefined>((resolve) => {
              categoriesCol
                .doc(category)
                .collection('entries')
                .doc(recipeId)
                .get()
                .then((doc) => {
                  if (doc.exists) {
                    resolve(category);
                  } else {
                    resolve(undefined);
                  }
                });
            }),
        ),
      )
    ).filter(nonNullable);

    categoriesContainingRecipe.forEach((category) => {
      writeBatch.delete(
        categoriesCol.doc(category).collection('entries').doc(recipeId),
      );
      writeBatch.update(categoriesCol.doc(category), {
        nbEntries: FirebaseService.DECREMENT,
      });
    });
  }

  batchWriteRecipeCategories(
    writeBatch: WriteBatch,
    recipeId: string,
    categories: string[] | undefined,
  ): void {
    if (!categories || categories.length === 0) return;

    const categoriesCol = this.firebase.collection('lb-recipes-categories');
    categories.forEach((category) => {
      writeBatch.set(
        categoriesCol.doc(category).collection('entries').doc(recipeId),
        {
          recipeId,
        },
      );
      writeBatch.set(categoriesCol.doc(category), {
        nbEntries: FirebaseService.INCREMENT,
      });
    });
  }
}
