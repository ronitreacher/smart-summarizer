# smart-meeting-summarizer/backend/Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Install ffmpeg, which is a dependency for pydub to process various audio formats
# This needs to be done before installing python packages
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Gunicorn will listen on the port provided by Cloud Run
# The PORT environment variable is automatically set by Cloud Run.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
