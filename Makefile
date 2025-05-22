CYPRESS=./node_modules/.bin/cypress

ifndef SERVER_VERSION
SERVER_VERSION = develop
endif

ifeq ($(SERVER_VERSION),develop)
compose_file = compose.develop.yml
else
compose_file = compose.1.x.yml
endif

.PHONY: install
install:
	@npm install

.PHONY: start
start:
	@cd fdp && docker compose -f $(compose_file) up -d

.PHONY: stop
stop:
	@cd fdp && docker compose -f $(compose_file) down

.PHONY: run
run:
	@CYPRESS_RETRIES=5 $(CYPRESS) run --record
# set CYPRESS_RECORD_KEY envvar (will be automatically used)
# see https://docs.cypress.io/guides/guides/continuous-integration.html#Environment-variables

.PHONY: wait
wait:
	@while ! curl http://localhost:8080/actuator/health 2>/dev/null; \
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
	make start
	make wait
	make run
	make stop

.PHONY: clean
clean:
	@rm -rf output


.PHONY: logs
logs:
	@cd fdp && docker compose -f $(compose_file) logs