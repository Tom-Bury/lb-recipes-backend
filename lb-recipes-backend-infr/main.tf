terraform {
  required_version = ">= 0.14"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.17.0"
    }
  }
}

provider "google" {
  project = var.GOOGLE_CLOUD_PROJECT_ID

  region = var.GOOGLE_CLOUD_REGION
  zone   = var.GOOGLE_CLOUD_ZONE

  credentials = file(var.TERRAFORM_SA_CREDS_FILE_PATH)
}

resource "google_project_service" "service_usage_api" {
  service                    = "serviceusage.googleapis.com"
  disable_on_destroy         = false
  disable_dependent_services = false
}

resource "google_project_service" "cloud_resource_manager_api" {
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = true

  depends_on = [google_project_service.service_usage_api]
}

resource "google_project_service" "iam_api" {
  service            = "iam.googleapis.com"
  disable_on_destroy = true

  depends_on = [google_project_service.cloud_resource_manager_api]
}