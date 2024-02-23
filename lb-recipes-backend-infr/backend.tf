# Define which terraform BE to use to store its state files
terraform {
  backend "gcs" {
    bucket = "liesbury-recipes-gcp-terraform-state"
    prefix = "terraform/state"
  }
}