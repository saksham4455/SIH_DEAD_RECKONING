.PHONY: all build-core run-backend run-flutter sim

all: build-core

build-core:
	bash scripts/build_cpp.sh

run-backend:
	uvicorn app.main:app --app-dir backend --reload

run-flutter:
	cd frontend && flutter run

sim:
	bash scripts/run_simulation.sh
