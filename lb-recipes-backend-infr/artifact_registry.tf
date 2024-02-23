# Enables artifact registry API
resource "google_project_service" "artifact_registry_api" {
  service = "artifactregistry.googleapis.com"
  disable_on_destroy = true
}

# Artifact registry for docker images
resource "google_artifact_registry_repository" "lb_recipes_docker_container_repo" {
  location      = var.GOOGLE_CLOUD_REGION
  repository_id = "lb-recipes-docker-container-repo"
  description   = "Docker repository for storing lb-recipes container images"
  format        = "DOCKER"

  # Waits for the Artifact Registry  API to be enabled
  depends_on = [google_project_service.artifact_registry_api]
}
