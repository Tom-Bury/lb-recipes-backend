# Recipe thumbs bucket
module "recipes_images_bucket" {
  source      = "./modules/service-account-bucket"
  bucket_name = "lb-recipes-previews-${var.GOOGLE_CLOUD_PROJECT_ID}"
  service_account_emails = [
    google_service_account.lb_recipes_backend_cloud_run_sa.email,
  ]
  service_account_role = "roles/storage.objectAdmin"
  public               = true
}
