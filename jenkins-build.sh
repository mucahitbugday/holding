#!/bin/bash

# Jenkins build script for Docker Compose

# Check if docker-compose V2 is available (docker compose)
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "Using Docker Compose V2 (docker compose)"
    docker compose up -d --build
    exit_code=$?
elif command -v docker-compose &> /dev/null; then
    echo "Using Docker Compose V1 (docker-compose)"
    docker-compose up -d --build
    exit_code=$?
else
    echo "ERROR: Neither 'docker compose' nor 'docker-compose' found!"
    echo "Please install Docker Compose or ensure Docker Compose V2 is available"
    exit 1
fi

# Check if containers started successfully
if [ $exit_code -eq 0 ]; then
    echo "Build successful! Containers are running."
    docker compose ps || docker-compose ps
else
    echo "Build failed with exit code: $exit_code"
    exit $exit_code
fi

