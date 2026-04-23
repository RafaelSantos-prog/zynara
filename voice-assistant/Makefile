PYTHON ?= python3
PIP ?= pip
VENV_PYTHON := .venv/bin/python
PYTHON_CMD := $(if $(wildcard $(VENV_PYTHON)),$(VENV_PYTHON),$(PYTHON))
TEXT ?= Olá, eu sou a Zynara.

.PHONY: run once devices test install
.PHONY: tts-test

run:
	PYTHONPATH=src $(PYTHON_CMD) -m voice_assistant

once:
	PYTHONPATH=src $(PYTHON_CMD) -m voice_assistant --once

devices:
	PYTHONPATH=src $(PYTHON_CMD) -m voice_assistant --list-devices

test:
	PYTHONPATH=src $(PYTHON_CMD) -m pytest

install:
	$(PYTHON) -m venv .venv
	PYTHONPATH=src $(VENV_PYTHON) -m pip install -r requirements.txt

tts-test:
	PYTHONPATH=src $(PYTHON_CMD) -m voice_assistant --say "$(TEXT)"
