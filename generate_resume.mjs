#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const defaultHtml = path.join(workspaceRoot, 'Resume_SDE.html');
const defaultPdf = path.join(workspaceRoot, 'Resume_SDE.pdf');

function parseArgs(argv) {
  const args = { input: defaultHtml, output: defaultPdf };

  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];

    if ((value === '--input' || value === '-i') && argv[index + 1]) {
      args.input = path.resolve(workspaceRoot, argv[index + 1]);
      index += 1;
      continue;
    }

    if ((value === '--output' || value === '-o') && argv[index + 1]) {
      args.output = path.resolve(workspaceRoot, argv[index + 1]);
      index += 1;
      continue;
    }
  }

  return args;
}

function findChromeBinary() {
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function renderWithPlaywright(htmlPath, pdfPath) {
  const { chromium } = await import('playwright');

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1800 },
      deviceScaleFactor: 1,
    });

    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: pdfPath,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    await browser.close();
  }
}

function renderWithChrome(htmlPath, pdfPath) {
  const chrome = findChromeBinary();

  if (!chrome) {
    throw new Error(
      'No Chromium/Chrome binary found. Install Playwright with Chromium or set CHROME to a browser executable path.'
    );
  }

  const result = spawnSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    throw new Error(`Chrome exited with code ${result.status ?? 'unknown'}`);
  }
}

async function main() {
  const { input, output } = parseArgs(process.argv);

  if (!existsSync(input)) {
    throw new Error(`Input HTML not found: ${input}`);
  }

  try {
    await renderWithPlaywright(input, output);
    console.log(`Generated PDF with Playwright: ${output}`);
  } catch (error) {
    if (String(error?.message || error).includes("Cannot find package 'playwright'")) {
      renderWithChrome(input, output);
      console.log(`Generated PDF with Chrome fallback: ${output}`);
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});