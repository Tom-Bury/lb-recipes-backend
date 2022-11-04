# Enables the Cloud Run API
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"

  disable_on_destroy = true
}

# Service account for the cloud run instance
resource "google_service_account" "sa_recipes_service" {
  account_id   = "sa-lb-recipes-backend"
  display_name = "sa-lb-recipes-backend"
}

# Ensure service account can access FireStore
resource google_project_iam_member "firestore_user" {
  project = var.GOOGLE_CLOUD_PROJECT_ID
  role   = "roles/datastore.user"
  member = "serviceAccount:${google_service_account.sa_recipes_service.email}"
}

# Create the Cloud Run service
resource "google_cloud_run_service" "recipes_service" {
  name = "lb-recipes-backend"
  location = var.region

  template {
    spec {
      timeout_seconds = 15
      service_account_name = google_service_account.sa_recipes_service.email

      containers {
        image = var.container_img

        env {
          name = "TF_VAR_GOOGLE_CLOUD_PROJECT_ID"
          value = var.GOOGLE_CLOUD_PROJECT_ID
        }

        env {
          name = "TF_VAR_ADMIN_PASSWORD"
          value = var.ADMIN_PASSWORD
        }

        env {
          name = "TF_VAR_AUTH_JWT_SECRET"
          value = var.AUTH_JWT_SECRET
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
