CYPRESS=./node_modules/.bin/cypress

.PHONY: install
install:
	@npm install

.PHONY: init
init:
	cp -r fdp/graphdb-template fdp/graphdb

.PHONY: start
start:
	@cd fdp && docker-compose pull && docker-compose up -d

.PHONY: stop
stop:
	@cd fdp && docker-compose down

.PHONY: run
run:
	@CYPRESS_RETRIES=5 $(CYPRESS) run

.PHONY: all
all:
	@make clean && make start && ($(CYPRESS) run || true) && make stop

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
	make stop
	make clean
	make init
	make start
	make wait
	make run
	make stop

.PHONY: clean
clean:
	@rm -rf output && rm -rf fdp/graphdb
