import { Configs } from './interfaces/config.interface';
import { VERSION } from './version';

export const config: () => Configs = () => {
  const result: Record<keyof Configs, string | number | boolean | undefined> = {
    port: parseInt(process.env.PORT || '3000'),
    googleCloudProjectId: process.env.TF_VAR_GOOGLE_CLOUD_PROJECT_ID,
    adminPassword: process.env.TF_VAR_ADMIN_PASSWORD,
    authJwtSecret: process.env.TF_VAR_AUTH_JWT_SECRET,
    version: VERSION,
    serviceAccountEmail: process.env.CLOUD_RUN_SA_EMAIL || 'unused',
    serviceAccountPrivateKey: process.env.CLOUD_RUN_SA_PRIVATE_KEY || 'unused',
    usePassedServiceAccountCredentials: Boolean(
      process.env.CLOUD_RUN_SA_EMAIL && process.env.CLOUD_RUN_SA_PRIVATE_KEY,
    ),
  };

  for (const [key, value] of Object.entries(result)) {
    if (value === undefined) {
      throw new Error(`Missing config value for '${key}'`);
    }
  }

  return result as Configs;
};
