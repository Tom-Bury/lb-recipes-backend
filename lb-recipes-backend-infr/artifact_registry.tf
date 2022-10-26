# Enables artifact registry API
resource "google_project_service" "artifact_registry_api" {
  service = "artifactregistry.googleapis.com"

  disable_on_destroy = true
}

# Artifact registry for docker images
resource "google_artifact_registry_repository" "artifact_registry_repo" {
  location      = var.region
  repository_id = "lb-recipes-artifact-registry"
  description   = "Docker repository for storing lb-recipes container images"
  format        = "DOCKER"

  # Waits for the Artifact Registry  API to be enabled
  depends_on = [google_project_service.artifact_registry_api]
}


# docker tag lb-recipes:v0.1 europe-west1-docker.pkg.dev/liesbury-recipes-322314/lb-recipes-artifact-registry/lb-recipes:v0.1

# docker push europe-west1-docker.pkg.dev/liesbury-recipes-322314/lb-recipes-artifact-registry/lb-recipes:v0.1