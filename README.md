# Resume Generator

This repository contains a single-file HTML resume and a small automation setup that turns that HTML into a PDF.

## What you edit

- Edit the visible resume content in [Resume_SDE.html](Resume_SDE.html).
- Keep the content inside the `<body>` section focused on the sections you want the PDF to show.
- Update skills, experience bullets, project titles, links, and achievements directly in the HTML.

## What gets generated

- [generate_resume.mjs](generate_resume.mjs) renders the HTML to a PDF.
- [Makefile](Makefile) provides a one-command wrapper for that script.
- The default output is [Resume_SDE.pdf](Resume_SDE.pdf).

## Quick start

1. Install dependencies once:

```bash
npm install
npx playwright install --with-deps chromium
```

If you want a single command for the bootstrap step, use:

```bash
make setup
```

2. Generate the default resume PDF:

```bash
make resume
```

3. If you want to render a different HTML file, pass it through the `HTML` variable:

```bash
make resume HTML=your_resume.html
```

4. If you want a custom PDF name too, pass `PDF`:

```bash
make resume HTML=your_resume.html PDF=your_resume.pdf
```

## Direct script usage

If you prefer to skip `make`, run the Node script directly:

```bash
node generate_resume.mjs --input Resume_SDE.html --output Resume_SDE.pdf
```

The script prefers Playwright first. If Playwright is unavailable, it falls back to a local Chrome or Chromium binary when one exists.

## How the workflow fits together

1. Open the HTML file and edit the resume content.
2. Save the file.
3. Run `make resume` or `node generate_resume.mjs`.
4. Open the generated PDF and verify spacing, page fit, links, and spelling.

## Notes

- Keep bullets short and impact-focused.
- Because the HTML is the source of truth, PDF changes always come from the HTML file.
- The repo is intentionally lightweight so you can regenerate the resume quickly after each edit.