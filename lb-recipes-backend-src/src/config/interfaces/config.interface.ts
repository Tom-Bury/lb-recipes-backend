export interface Configs {
  port: number;
  googleCloudProjectId: string;
  adminPassword: string;
  authJwtSecret: string;
  version: string;
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  usePassedServiceAccountCredentials: boolean;
}
