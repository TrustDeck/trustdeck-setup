#!/usr/bin/env bash
# Exports the REST API spec and the permission actions of a trustdeck-backend
# checkout into api/. Run it from the site folder. Needs Java 21, Maven, curl and Node.
#
# Usage: bash scripts/export-api-spec.sh <path to trustdeck-backend>

# Stop at the first command that fails.
set -euo pipefail

site=$PWD
backend=$(realpath "$1")
log="$backend/target/export-api-spec.log"

cd "$backend"

# Build the backend. The generated database code (jOOQ) is committed,
# so the build needs no database.
mvn --batch-mode --quiet package -DskipTests -Djooq.skip=true

# Load the example settings as environment variables for the backend.
# "set -a" exports every variable that is set until "set +a".
set -a
source trustdeck.env.example
set +a

# Database and Keycloak are not needed: point them to an address where nothing
# answers. The backend still starts far enough to serve its spec.
export KEYCLOAK_SERVER_URI=http://127.0.0.1:9
export KEYCLOAK_HOSTNAME=http://127.0.0.1:9
export DATABASE_TRUSTDECK_HOST=127.0.0.1
export HTTP_PROXY= HTTPS_PROXY= NO_PROXY=

# Start the backend in the background, with a formatted spec of the /api endpoints.
java -jar target/trustdeck-*.jar \
  --springdoc.paths-to-match='/api/**' \
  --springdoc.writer-with-default-pretty-printer=true \
  > "$log" 2>&1 &
backend_pid=$!

# Stop the backend when this script ends, also if a later step fails.
trap 'kill "$backend_pid"' EXIT

# Wait up to a minute for the backend, then save the spec. The file is only
# written if the download works, so a failed run keeps the old spec.
curl --silent --fail --retry 30 --retry-connrefused --retry-delay 2 \
  --output "$site/api/openapi.json" \
  http://localhost:8080/v3/api-docs

cd "$site"
node scripts/extract-actions.mjs "$backend/src/main/resources/application.yml"

echo "Updated api/openapi.json and api/actions.json. Run 'npm run api-spec' to check api-docs/."
