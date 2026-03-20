import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import ejs from 'ejs';

/**
 * Process a template directory, rendering .ejs files and copying others.
 *
 * @param {string} srcDir - Source template directory
 * @param {string} destDir - Destination output directory
 * @param {object} data - EJS template variables
 * @param {object} [options] - Additional options
 * @param {string[]} [options.skip] - Glob patterns to skip
 */
export function processTemplateDir(srcDir, destDir, data, options = {}) {
  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const isEjs = entry.name.endsWith('.ejs');
    const destName = isEjs ? entry.name.slice(0, -4) : entry.name;
    const destPath = join(destDir, destName);

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      processTemplateDir(srcPath, destPath, data, options);
    } else if (isEjs) {
      renderEjsFile(srcPath, destPath, data);
    } else {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Render a single EJS template file to the destination.
 */
export function renderEjsFile(srcPath, destPath, data) {
  const template = readFileSync(srcPath, 'utf-8');
  const rendered = ejs.render(template, data, { filename: srcPath });

  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, rendered, 'utf-8');
}

/**
 * Copy a directory tree as-is (no EJS processing).
 */
export function copyDir(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
