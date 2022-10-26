export const config = () => ({
  port: parseInt(process.env.PORT || '3000'),
  googleCloudProjectId: process.env.TF_VAR_GOOGLE_CLOUD_PROJECT_ID,
  firebaseSAEmail: process.env.TF_VAR_FIREBASE_SA_EMAIL,
  firebaseSAPrivateKey: process.env.TF_VAR_FIREBASE_SA_PRIVATE_KEY,
  version: process.env.VERSION,
});
