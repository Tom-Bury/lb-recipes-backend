# Which infrastructure provider is to be used

provider "google" {
  project = var.GOOGLE_CLOUD_PROJECT_ID
  region  = var.region
}
