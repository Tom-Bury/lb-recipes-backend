# lb-recipes-backend

Repository containing the infrastructure & code for the backend used by [Liesbury's Receptenlijst](https://recepten.lies.bury.dev)
Main goal was to test out  NestJS & Google Cloud Run.

## Folder structure
- `lb-recipes-backend-infr`: contains the Terraform code to provision the resources needed for this application on Google Cloud. Infrastructure consists of:
  - Artifact Registry for storing the Docker images of the backend NestJS application
  - A Cloud Run instance of the latest version
  - A FireStore database to act as main database for the application
  - A Google Cloud Bucket to store images in that are used on the site
- `lb-recipes-backend-src`: contains a NestJS application. Follows the basic NestJS setup & first steps documentation, making use of:
  - Basic CRUD API routes
  - Validation
  - Authentication for admin using a password & `passport` which yields a JWT token to access protected routes
- `...`: Various scripts to help build the Docker image, push it to Artifact Registry & deploy it using Terraform

