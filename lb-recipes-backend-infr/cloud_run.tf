# Enables the Cloud Run API
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"

  disable_on_destroy = true
}

# Create the Cloud Run service
resource "google_cloud_run_service" "recipes_service" {
  name = "lb-recipes"
  location = var.region

  template {
    spec {
      timeout_seconds = 15

      containers {
        image = var.container_img

        env {
          name = "GOOGLE_CLOUD_PROJECT_ID"
          value = var.GOOGLE_CLOUD_PROJECT_ID
        }

        env {
          name = "FIREBASE_SA_EMAIL"
          value = var.FIREBASE_SA_EMAIL
        }

        env {
          name = "FIREBASE_SA_PRIVATE_KEY"
          value = var.FIREBASE_SA_PRIVATE_KEY
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.run_api]
}

# Make recipes_service publicly accessible
resource "google_cloud_run_service_iam_member" "recipes_service_public" {
  service  = google_cloud_run_service.recipes_service.name
  location = google_cloud_run_service.recipes_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
