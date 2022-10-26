# Display the service URL
output "service_url" {
  value = google_cloud_run_service.recipes_service.status[0].url
}
