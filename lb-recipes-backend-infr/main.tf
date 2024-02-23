terraform {
  required_version = ">= 0.14"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.51.0"
    }
  }
}

provider "google" {
  project = var.GOOGLE_CLOUD_PROJECT_ID

  region = var.GOOGLE_CLOUD_REGION
  zone   = var.GOOGLE_CLOUD_ZONE

  credentials = file(var.TERRAFORM_SA_CREDS_FILE_PATH)
}
