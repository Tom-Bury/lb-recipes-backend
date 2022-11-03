# Recipe thumbs bucket
module "recipes_images_bucket" {
  source = "./modules/service-account-bucket"
  bucket_name = "test_recipes_thumbs_${var.GOOGLE_CLOUD_PROJECT_ID}"
  service_account_emails = [
    google_service_account.sa_recipes_service.email,
  ]
  service_account_role = "roles/storage.objectAdmin"
  public = true
}