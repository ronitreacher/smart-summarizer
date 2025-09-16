Smart Meeting Summarizer & Action Tracker Deployment Guide:

This document provides a complete guide for deploying the Smart Meeting Summarizer, a full-stack web application, on Google Cloud Platform. It covers setting up the backend (Python/Flask) and frontend (React/NGINX) on Cloud Run, managing secrets, and configuring a global HTTPS load balancer with a custom domain.

Steps to run the application locally:
Backend setup:
    1. Navigate to backend directory of the smart-meeting-summarizer app
    2. create a virtual env by running->  python -m venv venv
    3. activate the venv-> source venv/Scripts/activate(linux/git bash)
        .\venv\Scripts\Activate.ps1(powershell)
    4. install dependencies-> pip install -r requirements.txt 
    5. set the openai API key-> export OPENAI_API_KEY="your_secret_api_key_here"(linux/git bash)
        $env:OPENAI_API_KEY="your_secret_api_key_here"(powershell)
    6. run the flask server-> python app.py
Front end setup:
    1. Navigate to the frontend directory of the smart-meeting-summarizer app
    2.  Install dependencies: npm install
    3.  Create an environment file: Create a new file in the frontend directory named .env. Add the following line to it. This tells your React app where to find the backend API.
        REACT_APP_API_URL=http://localhost:5000
    4. Start the React development server->  npm start

add .wav audio file and click the button Upload & Analyze...you can see the transcribe,summary and action points


Steps for deploying in GCP and get the public url:


1. Prerequisites
Before starting, ensure you have a Google Cloud project, a domain name (e.g., from GoDaddy), and the gcloud CLI installed and authenticated.

Set the project ID and enable the necessary APIs:

bash
# Set your project ID
gcloud config set project [PROJECT_ID]

# Enable required services
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    vpcaccess.googleapis.com \
    certificatemanager.googleapis.com

2. Secrets Management
Store the OpenAI API key securely in Secret Manager. This prevents it from being exposed in your code or container images.

bash
# Create the secret
echo "REQUIRED_OPENAI_API_KEY_HERE" | gcloud secrets create OPENAI_API_KEY --data-file=-

# Grant the Cloud Run service account access to the secret
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

3. Docker and Cloud Build Configuration
The application is containerized using Docker and deployed via a multi-step Cloud Build pipeline.

Backend Dockerfile
The backend requires Python and ffmpeg for audio processing.

text
# smart-meeting-summarizer/backend/Dockerfile
FROM python:3.11-slim

# Install ffmpeg for pydub
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# The PORT environment variable is automatically set by Cloud Run.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
Frontend Dockerfile
The frontend uses a multi-stage build to create a lightweight NGINX server for the static React files. The startup script dynamically sets the port required by Cloud Run.

text
# smart-meeting-summarizer/frontend/Dockerfile

# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Stage 2: Serve the static files with NGINX
FROM nginx:1.25-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh
EXPOSE 8080
CMD ["/start-nginx.sh"]
cloudbuild.yaml
This file orchestrates the entire deployment, ensuring services are built and deployed in the correct order.

4. Networking Setup (VPC Connector and NAT)

To allow the backend Cloud Run service to make outbound requests to the OpenAI API,configure a VPC Connector and a Cloud NAT gateway.

Create a Serverless VPC Connector: In the GCP Console, go to VPC Network > Serverless VPC access and create a connector in your service region (us-central1).

Create a Cloud NAT Gateway: Go to Network Services > Cloud NAT and create a gateway for your default VPC network in the same region, attaching it to a new or existing Cloud Router.

5. Running the Full Deployment
With all configuration files (Dockerfile, .dockerignore, cloudbuild.yaml, etc.) in place, run the following command from the root of your project to start the build and deployment process:

bash command(from root folder):

gcloud builds submit --config cloudbuild.yaml .

6. Load Balancer and SSL Certificate Setup
To serve the application from a custom domain over HTTPS, you'll configure a Global External HTTPS Load Balancer.

Create a Global SSL Certificate:

In the GCP Console, go to Certificate Manager.

Create a Google-managed certificate with a Global scope for the domain.

Complete the DNS Authorization step by adding the provided CNAME record to your domain's DNS settings at your registrar (e.g., GoDaddy).

Create a Certificate Map:

In Certificate Manager, go to the Certificate maps tab and create a new map (e.g., summarizer-cert-map).

Add entries to the map, linking domain names to the global certificate you created.

Create the Global HTTPS Load Balancer:

Go to Network Services > Load balancing.

Choose "Best for global workloads (Classic Application Load Balancer)".

Frontend: Create an HTTPS frontend, reserve a new Global static IP address, and attach your Certificate Map.

Backend: Create a backend service that points to a Serverless network endpoint group (NEG) for your smart-summarizer-frontend Cloud Run service.

Update DNS Records:

At your domain registrar (GoDaddy), create two A records: one for the root domain (@) and one for www.

Point both records to the Global static IP address you reserved for the load balancer.

7. Troubleshooting Common Errors
Permission denied during npm run build: Add node_modules to your frontend's .dockerignore file.

openai.APIConnectionError: Ensure your OpenAI account has billing enabled and that your Cloud Run service has outbound internet access via a NAT gateway.

Certificate Not Visible in Dropdown: This is a common UI issue caused by a scope mismatch. Ensure you are using a Global Load Balancer with a Global certificate. If the issue persists, use a Certificate Map to attach the certificate.

DNS Conflict (Record name www conflicts...): In GoDaddy, delete any pre-existing CNAME or A records for the www subdomain before adding your new A record.