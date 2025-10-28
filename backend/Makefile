.PHONY: ruff_fix ruff_check test-fetcher test-all build_dev start_dev stop_dev

ruff_fix:
	ruff check --fix . && \
	ruff check --fix --select I . && \
	ruff format .

ruff_check:
	ruff check . && \
	ruff check --select I . && \
	ruff format --check .

test-fetcher:
	docker compose -f compose-test.yml run --build --rm fetcher-tests

test-all:
	docker compose -f compose-test.yml up --build --abort-on-container-exit

build_dev:
	docker compose build

start_dev:
	docker compose up -d

stop_dev:
	docker compose down
