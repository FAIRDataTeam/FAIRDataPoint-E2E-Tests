#!/bin/sh

# Create a docker compose file based on template

# Get Docker image names from environment, with fallback to develop
SERVER_IMAGE="${SERVER_IMAGE:-fairdata/fairdatapoint:develop}"
CLIENT_IMAGE="${CLIENT_IMAGE:-fairdata/fairdatapoint-client:develop}"

# Path to Docker Compose file (to be created)
DOCKER_COMPOSE_FILE=fdp/compose.yml

# Copy template into new Docker Compose file
cp fdp/compose.template.yml $DOCKER_COMPOSE_FILE

# Replace Docker image names in newly created Docker Compose file
# (backup file as .bak, remove backup after successful edit)
# (uses `#` as `sed` delimiter, instead of default `/`, because the search and replace strings contain `/`)
sed --in-place=.bak "s#{SERVER_IMAGE}#$SERVER_IMAGE#" $DOCKER_COMPOSE_FILE && rm $DOCKER_COMPOSE_FILE".bak"
sed --in-place=.bak "s#{CLIENT_IMAGE}#$CLIENT_IMAGE#" $DOCKER_COMPOSE_FILE && rm $DOCKER_COMPOSE_FILE".bak"

# Show result
echo "Initialized docker compose file:"
cat $DOCKER_COMPOSE_FILE
