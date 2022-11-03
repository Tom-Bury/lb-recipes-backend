#
# App engine + Firestore DB
#

# App engine is only created once https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/app_engine_application

# resource "google_app_engine_application" "app" {
#   project     = var.project
#   location_id = "europe-west"
#   database_type = "CLOUD_FIRESTORE"
# }

# resource google_project_service "firestore" {
#   service = "firestore.googleapis.com"
#   disable_dependent_services = true
# }

##
## Collections
##

# resource "google_firestore_document" "title-index-doc" {
#   project     = var.project
#   collection  = "lb-recipes-metadata"
#   document_id = "title-index"
#   fields      = ""
# }