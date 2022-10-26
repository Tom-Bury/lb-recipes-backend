variable "GOOGLE_CLOUD_PROJECT_ID" {}

variable "FIREBASE_SA_EMAIL" {}

variable "FIREBASE_SA_PRIVATE_KEY" {}

variable "region" {
	default = "europe-west1" 
}

variable "container_img" {
  default = "europe-west1-docker.pkg.dev/liesbury-recipes-322314/lb-recipes-artifact-registry/lb-recipes:v0.1"
}
