# Define which terraform BE to use to store its state files
terraform {
  backend "gcs" {
    bucket = "liesbury-recipes-gcp-terraform-state"
    prefix = "terraform/state"
    credentials = var.TERRAFORM_SA_CREDS_FILE_PATH # TODO: fill in manually, but don't commit. Variables cannot be used here 
  }
}