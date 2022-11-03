import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Configs } from 'src/config/interfaces/config.interface';
import { Storage } from '@google-cloud/storage';

const COLLECTIONS = ['lb-recipes', 'lb-recipes-metadata'] as const;
type TCollectionId = typeof COLLECTIONS[number];

const BUCKETS = ['recipes_thumbs_liesbury-recipes-322314'] as const;
type TBucketId = typeof BUCKETS[number];

@Injectable()
export class FirebaseService {
  private db: Firestore;
  private storage: Storage;

  constructor(private readonly configService: ConfigService<Configs, true>) {
    try {
      admin.initializeApp({
        projectId: this.configService.get('googleCloudProjectId'),
        credential: admin.credential.cert({
          projectId: this.configService.get('googleCloudProjectId'),
          clientEmail: this.configService.get('firebaseSAEmail'),
          privateKey: this.configService.get('firebaseSAPrivateKey'),
        }),
      });
      this.db = getFirestore();
      this.storage = new Storage();
      this.db.settings({ ignoreUndefinedProperties: true });
    } catch (error) {
      console.error(error);
      this.storage = new Storage();
      this.db = getFirestore();
    }
  }

  collection(collectionId: TCollectionId) {
    return this.db.collection(collectionId);
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

  getStorageFileUrl(fileName: string, bucketId: TBucketId): string {
    return `https://storage.googleapis.com/${bucketId}/${fileName}`;
  }
}
