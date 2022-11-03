import { Configs } from './interfaces/config.interface';
import { VERSION } from './version';

export const config: () => Configs = () => {
  const result: Record<keyof Configs, string | number | undefined> = {
    port: parseInt(process.env.PORT || '3000'),
    googleCloudProjectId: process.env.TF_VAR_GOOGLE_CLOUD_PROJECT_ID,
    firebaseSAEmail: process.env.TF_VAR_FIREBASE_SA_EMAIL,
    firebaseSAPrivateKey: process.env.TF_VAR_FIREBASE_SA_PRIVATE_KEY,
    version: VERSION,
    adminPassword: process.env.TF_VAR_ADMIN_PASSWORD,
    authJwtSecret: process.env.TF_VAR_AUTH_JWT_SECRET,
  };

  for (const [key, value] of Object.entries(result)) {
    if (value === undefined) {
      throw new Error(`Missing config value for '${key}'`);
    }
  }

  return result as Configs;
};
