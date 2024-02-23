# Define which terraform BE to use to store its state files
terraform {
  backend "gcs" {
    bucket = var.TERRAFORM_STATE_BUCKET_NAME
    prefix = "terraform/state"
  }
}