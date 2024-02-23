resource "google_storage_bucket" "bucket" {
  name = var.bucket_name
  location = var.bucket_location
  force_destroy = false
  uniform_bucket_level_access = true
}

data "google_iam_policy" "bucket_policy_data" {
  dynamic "binding" {
    for_each = var.public ? [1] : []
    content {
      role = "roles/storage.objectViewer"
      members = [
        "allUsers",
      ]
    }
  }


  binding {
    role = var.service_account_role
    members = formatlist("serviceAccount:%s", var.service_account_emails)
  }
}

resource "google_storage_bucket_iam_policy" "bucket_iam_policy" {
  bucket = google_storage_bucket.bucket.name
  policy_data = data.google_iam_policy.bucket_policy_data.policy_data
}