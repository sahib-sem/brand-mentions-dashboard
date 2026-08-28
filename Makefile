.PHONY: install seed migrate dev-api dev-web test test-api test-web check check-api check-web build

install:
	uv --directory backend sync
	npm --prefix frontend install

seed:
	uv --directory backend run python seed_db.py

migrate:
	uv --directory backend run alembic upgrade head

dev-api:
	uv --directory backend run uvicorn main:app --reload

dev-web:
	npm --prefix frontend run dev

test: test-api test-web

test-api:
	uv --directory backend run pytest

test-web:
	npm --prefix frontend run test:e2e

check: check-api check-web

check-api:
	uv --directory backend run ruff check .
	uv --directory backend run pyright

check-web:
	npm --prefix frontend run lint
	npm --prefix frontend run typecheck

build:
	npm --prefix frontend run build
