CYPRESS=./node_modules/.bin/cypress

# allow selection of database (see docker compose template)
# usage example: `make DB=mongo`
DB = postgres

.PHONY: install
install:
	@npm install

.PHONY: init
init:
	@scripts/init.sh

.PHONY: start
start:
	@cd fdp && docker compose --profile $(DB) up -d

.PHONY: stop
stop:
	@cd fdp && docker compose down

.PHONY: run
run:
	@CYPRESS_RETRIES=5 $(CYPRESS) run --record
# set CYPRESS_RECORD_KEY envvar (will be automatically used)
# see https://docs.cypress.io/guides/guides/continuous-integration.html#Environment-variables

.PHONY: wait
wait:
	@while ! curl http://localhost:3000/actuator/health 2>/dev/null; \
	do \
		echo "Retrying ..."; \
		sleep 2; \
	done

.PHONY: open
open:
	CYPRESS_RETRIES=3 $(CYPRESS) open

.PHONY: ci
ci:
	make clean
	make init
	make start
	make wait
	make run
	make stop

.PHONY: clean
clean:
	@rm -rf output && rm -rf fdp/graphdb && rm -f fdp/compose.yml && rm -rf fdp/openrefine-cfg/*.yaml


.PHONY: logs
logs:
	@cd fdp && docker compose logs -f