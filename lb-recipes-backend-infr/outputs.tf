# Display the service URL
output "service_url" {
  value = google_cloud_run_v2_service.lb_recipes_backend_cloud_run_service.uri
}