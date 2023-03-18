# Recipe thumbs bucket
module "recipes_images_bucket" {
  source = "./modules/service-account-bucket"
  bucket_name = "lb_recipes_previews_${var.GOOGLE_CLOUD_PROJECT_ID}"
  service_account_emails = [
    google_service_account.sa_recipes_service.email,
  ]
  service_account_role = "roles/storage.objectAdmin"
  public = true
}

# Database exports bucket
resource "google_storage_bucket" "db_exports_bucket" {
  name = "lb_recipes_db_exports"
  location = "EUROPE-WEST1"
  force_destroy = false
  uniform_bucket_level_access = true
}