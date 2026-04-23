PYTHON ?= python3
NPM ?= npm
TEXT ?= Olá, eu sou a Zynara.

.PHONY: install-all dev-frontend dev-backend dev-all build typecheck voice-run voice-once voice-devices voice-test voice-tts-test

install-all:
	$(NPM) install
	$(PYTHON) -m venv voice-assistant/.venv
	. voice-assistant/.venv/bin/activate && python -m pip install -r voice-assistant/requirements.txt

dev-frontend:
	$(NPM) run dev --workspace frontend

dev-backend:
	$(NPM) run dev --workspace backend

dev-all:
	$(NPM) run dev:all

build:
	$(NPM) run build

typecheck:
	$(NPM) run typecheck

voice-run:
	$(MAKE) -C voice-assistant run PYTHON=$(PYTHON)

voice-once:
	$(MAKE) -C voice-assistant once PYTHON=$(PYTHON)

voice-devices:
	$(MAKE) -C voice-assistant devices PYTHON=$(PYTHON)

voice-test:
	$(MAKE) -C voice-assistant test PYTHON=$(PYTHON)

voice-tts-test:
	$(MAKE) -C voice-assistant tts-test PYTHON=$(PYTHON) TEXT="$(TEXT)"
