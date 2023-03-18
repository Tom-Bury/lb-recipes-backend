import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import {
  DocumentData,
  DocumentReference,
  FieldValue,
  Firestore,
  getFirestore,
  ReadOptions,
} from 'firebase-admin/firestore';
import { Configs } from 'src/config/interfaces/config.interface';
import { Storage } from '@google-cloud/storage';
import { applicationDefault, Credential } from 'firebase-admin/app';
import { getErrorMessage } from 'src/utils/error.utils';

const COLLECTIONS = [
  'lb-recipes',
  'lb-recipes-metadata',
  'lb-recipes-categories',
] as const;
type TCollectionId = typeof COLLECTIONS[number];

const BUCKETS = ['lb_recipes_previews_liesbury-recipes-322314'] as const;
type TBucketId = typeof BUCKETS[number];

@Injectable()
export class FirebaseService {
  private db: Firestore;
  private storage: Storage;
  private static TAG = 'FirebaseService';

  public static INCREMENT = FieldValue.increment(1);
  public static DECREMENT = FieldValue.increment(-1);

  constructor(private readonly configService: ConfigService<Configs, true>) {
    if (this.configService.get('usePassedServiceAccountCredentials')) {
      console.info(
        FirebaseService.TAG,
        'Using .env passed service account credentials',
      );
    } else {
      console.info(
        FirebaseService.TAG,
        'Using application default credentials',
      );
    }
    try {
      let shouldSetFirestoreSettings = false;
      if (admin.apps.length === 0) {
        shouldSetFirestoreSettings = true;
        admin.initializeApp({
          projectId: this.configService.get('googleCloudProjectId'),
          credential: this.getFirestoreCredentials(),
        });
      }
      this.db = getFirestore();
      this.storage = new Storage({
        projectId: this.configService.get('googleCloudProjectId'),
        ...this.getCloudStorageCredentials(),
      });
      if (shouldSetFirestoreSettings) {
        this.db.settings({ ignoreUndefinedProperties: true });
      }
    } catch (error) {
      console.error(FirebaseService.TAG, getErrorMessage(error));
      this.storage = new Storage({
        projectId: this.configService.get('googleCloudProjectId'),
        ...this.getCloudStorageCredentials(),
      });
      this.db = getFirestore();
    }
  }

  collection(collectionId: TCollectionId) {
    return this.db.collection(collectionId);
  }

  getAll(
    ...documentRefsOrReadOptions: Array<
      DocumentReference<DocumentData> | ReadOptions
    >
  ) {
    return this.db.getAll(...documentRefsOrReadOptions);
  }

  batch() {
    return this.db.batch();
  }

  async uploadFile(
    fileData: Buffer,
    fileName: string,
    bucketId: TBucketId,
  ): Promise<void> {
    const bucket = this.storage.bucket(bucketId);
    const newFileRef = bucket.file(fileName);
    return newFileRef.save(fileData);
  }

  async deleteAllFilesWithPrefix(
    fileNamePrefix: string,
    bucketId: TBucketId,
  ): Promise<void> {
    const bucket = this.storage.bucket(bucketId);
    return bucket.deleteFiles({ prefix: fileNamePrefix });
  }

  async listFilesWithPrefix(prefix: string, bucketId: TBucketId) {
    const bucket = this.storage.bucket(bucketId);
    const [files] = await bucket.getFiles({ prefix });
    return files.map((file) => file.name);
  }

  getStorageFileUrl(fileName: string, bucketId: TBucketId): string {
    return `https://storage.googleapis.com/${bucketId}/${fileName}`;
  }

  private getFirestoreCredentials(): Credential {
    return this.configService.get('usePassedServiceAccountCredentials')
      ? admin.credential.cert({
          projectId: this.configService.get('googleCloudProjectId'),
          clientEmail: this.configService.get('serviceAccountEmail'),
          privateKey: this.configService.get('serviceAccountPrivateKey'),
        })
      : applicationDefault();
  }

  private getCloudStorageCredentials():
    | { client_email: string; private_key: string }
    | Record<string, never> {
    return this.configService.get('usePassedServiceAccountCredentials')
      ? {
          client_email: this.configService.get('serviceAccountEmail'),
          private_key: this.configService.get('serviceAccountPrivateKey'),
        }
      : {};
  }
}
