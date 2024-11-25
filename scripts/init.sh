#!/bin/sh

# Create a docker compose file based on template

# Get Docker image versions from environment, with fallback to develop
SERVER_IMAGE="fairdata/fairdatapoint:${SERVER_VERSION:-develop}"
CLIENT_IMAGE="fairdata/fairdatapoint-client:${CLIENT_VERSION:-develop}"

# Path to Docker Compose file (to be created)
DOCKER_COMPOSE_FILE=fdp/compose.yml

# Copy template into new Docker Compose file
cp fdp/compose.template.yml $DOCKER_COMPOSE_FILE

# Replace Docker image names in newly created Docker Compose file
# (uses `#` as `sed` delimiter, instead of default `/`, because the search and replace strings contain `/`)
sed --in-place "s#{SERVER_IMAGE}#$SERVER_IMAGE#" $DOCKER_COMPOSE_FILE
sed --in-place "s#{CLIENT_IMAGE}#$CLIENT_IMAGE#" $DOCKER_COMPOSE_FILE

# Configure database based on FDP version
# (mongodb for <=1.17.x, postgresql for later versions)
case $SERVER_IMAGE in 
*1.16*|*1.17*)
# use mongodb
# todo: change `mongo` to `mongosh` (after upgrade to mongo >6.0)
cat <<'HEREDOC' >> $DOCKER_COMPOSE_FILE
    image: mongo:4.0.12
    hostname: mongo
    ports:
      - 127.0.0.1:27017:27017
    healthcheck:
      test: |
        [ $(mongo --quiet --host mongo:27017 --eval "db.runCommand('ping').ok") = 1 ] || exit 1
    restart: always
HEREDOC
;; 
*)
# use postgresql
cat <<'HEREDOC' >> $DOCKER_COMPOSE_FILE
    image: postgres
    ports:
      - 127.0.0.1:54321:5432
    healthcheck:
      test: pg_isready || exit 1
    environment:
      POSTGRES_DB: fdp
      POSTGRES_USER: fdp
      POSTGRES_PASSWORD: fdp
    restart: always
HEREDOC
;;
esac

# Show result
echo "Initialized docker compose file:"
cat $DOCKER_COMPOSE_FILE
