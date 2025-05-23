CYPRESS=./node_modules/.bin/cypress

# make has no starts-with, nor is there a simple way to get the first character from a string,
# so we insert a space after every "1" (if any), to split into separate words,
# then get the first word and check if it equals "1"
major_version = $(word 1, $(subst 1, 1 , $(SERVER_VERSION)))
ifeq ($(major_version), 1)
compose_file = compose.v1.yml
else
compose_file = compose.v2.yml
endif
$(info using $(compose_file))

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