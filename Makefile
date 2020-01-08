CYPRESS=npx cypress

.PHONY: install
install:
	@npm install


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


.PHONY: open
open:
	CYPRESS_RETRIES=3 $(CYPRESS) open

.PHONY: clean
clean:
	@rm -rf output