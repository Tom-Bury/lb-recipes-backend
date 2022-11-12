import { Injectable } from '@nestjs/common';
import { WriteBatch } from 'firebase-admin/firestore';
import { FirebaseService } from 'src/firebase/firebase.service';
import { nonNullable } from 'src/validation/typeValidation.utils';

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
