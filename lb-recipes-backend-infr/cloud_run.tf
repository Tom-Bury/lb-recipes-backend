# Enables the Cloud Run API
resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = true
}

# Service account for the cloud run instance
resource "google_service_account" "lb_recipes_backend_cloud_run_sa" {
  account_id   = "lb-recipes-backend-cloud-run-sa"
  display_name = "lb-recipes-backend-cloud-run-sa"
}

# Ensure service account can access FireStore
resource "google_project_iam_member" "firestore_user" {
  project = var.GOOGLE_CLOUD_PROJECT_ID
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.lb_recipes_backend_cloud_run_sa.email}"
}

# # Create the Cloud Run service
# resource "google_cloud_run_service" "lb_recipes_backend_cloud_run_service" {
#   name = "lb-recipes-backend"
#   location = var.GOOGLE_CLOUD_REGION

#   template {
#     spec {
#       timeout_seconds = 30
#       service_account_name = google_service_account.lb_recipes_backend_cloud_run_sa.email

#       containers {
#         image = var.container_img

#         resources {
#           limits = {
#             cpu = "1000m"
#             memory = "1024Mi"
#           }
#         }

#         env {
#           name = "TF_VAR_GOOGLE_CLOUD_PROJECT_ID"
#           value = var.GOOGLE_CLOUD_PROJECT_ID
#         }

#         env {
#           name = "TF_VAR_ADMIN_PASSWORD"
#           value = var.ADMIN_PASSWORD
#         }

#         env {
#           name = "TF_VAR_AUTH_JWT_SECRET"
#           value = var.AUTH_JWT_SECRET
#         }
#       }
#     }
#   }

#   traffic {
#     percent         = 100
#     latest_revision = true
#   }

#   # Waits for the Cloud Run API to be enabled
#   depends_on = [google_project_service.run_api]
# }

# # Make recipes_service publicly accessible
# resource "google_cloud_run_service_iam_member" "lb_recipes_backend_public" {
#   service  = google_cloud_run_service.lb_recipes_backend_cloud_run_service.name
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }
