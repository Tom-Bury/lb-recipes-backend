resource "google_project_service" "firestore" {
  service            = "firestore.googleapis.com"
  disable_on_destroy = true
}

resource "google_firestore_database" "lb_recipes_database" {
  name        = "lb-recipes-database"
  location_id = var.GOOGLE_CLOUD_REGION
  type        = "FIRESTORE_NATIVE"

  concurrency_mode            = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"
  delete_protection_state     = "DELETE_PROTECTION_ENABLED"

  depends_on = [google_project_service.firestore]
}

resource "google_firestore_backup_schedule" "lb_recipes_database_daily_backup" {
  database  = google_firestore_database.lb_recipes_database.name
  retention = "604800s" // 7 days (maximum possible value for daily backups)

  daily_recurrence {}
}

resource "google_firestore_document" "title_index_doc" {
  database    = google_firestore_database.lb_recipes_database.name
  collection  = "lb-recipes-metadata"
  document_id = "title-index"
  fields      = ""
}