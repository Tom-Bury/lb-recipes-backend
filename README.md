# lb-recipes-backend

Repository containing the infrastructure & code for the backend used by [Liesbury's Receptenlijst](https://recepten.lies.bury.dev)
Main goal was to test out NestJS & Google Cloud Run.

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

## Environment variables

Copy the `.env.example` file to `.env` and fill in the necessary values.
Use the `secrets/` folder to store any additional secrets that are needed, like service account credential JSONs.

## Versioning, Building and Deployment

### Automatic

Each push to the `main` branch will:

1. Trigger a version bump and place a version tag
2. Build the Docker image in a Github action
3. Push the image to the Artifact Registry

Afterwards, check out the latest commit on the `main` branch to see the latest version tag and deploy it using terraform:
  
```bash
./tf-apply.sh
```

### Manual

1. Use `./docker-build.sh` to version bump and build the Docker image
2. Validate the image by running it locally using `./docker-run.sh`
3. Push the image to the Artifact Registry using `./docker-push.sh`
4. Deploy the latest version using `./tf-apply.sh`