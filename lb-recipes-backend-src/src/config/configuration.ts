import { Configs } from './interfaces/config.interface';

export const config: () => Configs = () => {
  const result: Record<keyof Configs, string | number | undefined> = {
    port: parseInt(process.env.PORT || '3000'),
    googleCloudProjectId: process.env.TF_VAR_GOOGLE_CLOUD_PROJECT_ID,
    firebaseSAEmail: process.env.TF_VAR_FIREBASE_SA_EMAIL,
    firebaseSAPrivateKey: process.env.TF_VAR_FIREBASE_SA_PRIVATE_KEY,
    version: '0.0',
    adminPassword: process.env.TF_ADMIN_PASSWORD,
    authJwtSecret: process.env.TF_AUTH_JWT_SECRET,
  };

  for (const [key, value] of Object.entries(result)) {
    if (value === undefined) {
      throw new Error(`Missing config value for '${key}'`);
    }
  }

  return result as Configs;
};
