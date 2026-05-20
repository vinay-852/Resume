HTML ?= Resume_SDE.html
PDF ?= $(HTML:.html=.pdf)

.PHONY: setup resume generate help

setup:
	npm install
	npx playwright install --with-deps chromium

resume generate:
	node generate_resume.mjs --input "$(HTML)" --output "$(PDF)"

help:
	@printf '%s\n' "Usage: make resume HTML=Resume_SDE.html" "       make resume HTML=custom_resume.html PDF=custom_resume.pdf"