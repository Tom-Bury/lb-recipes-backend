# Required
variable "bucket_name" {}
variable "service_account_role" {}
variable "service_account_emails" {
  type = list(string)
}
variable "bucket_location" {
  default = "EUROPE-WEST1"
}

variable "public" {
  default = false
}