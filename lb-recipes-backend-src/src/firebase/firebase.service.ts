import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Configs } from 'src/config/interfaces/config.interface';

@Injectable()
export class FirebaseService {
  private db: Firestore;

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
      this.db.settings({ ignoreUndefinedProperties: true });
    } catch (error) {
      console.error(error);
      this.db = getFirestore();
    }
  }

  collection(collectionId: string) {
    return this.db.collection(collectionId);
  }
}
