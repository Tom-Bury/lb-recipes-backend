# Enables artifact registry API
resource "google_project_service" "artifact_registry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = true

  depends_on = [google_project_service.cloud_resource_manager_api]
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

resource "google_service_account" "github_actions_sa" {
  account_id   = "github-actions-sa"
  display_name = "github-actions-sa"

  depends_on = [google_project_service.iam_api]
}

resource "google_project_iam_member" "github_actions_sa_artifact_registry" {
  project = var.GOOGLE_CLOUD_PROJECT_ID
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

resource "google_project_iam_member" "github_actions_sa_token_creator" {
  project = var.GOOGLE_CLOUD_PROJECT_ID
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}