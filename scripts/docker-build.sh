#!/bin/sh
# Builds a Docker image using the Docker file as if it was in a CI pipeline

docker build \
    -t gha-build-monitor \
    --build-arg "NODE_VERSION=${NODE_VERSION}" \
    --build-arg "JFROG_USERNAME=${JFROG_USERNAME}" \
    --build-arg "JFROG_API_KEY=${JFROG_API_KEY}" \
    .
