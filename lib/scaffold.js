import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execFileSync } from 'child_process';
import chalk from 'chalk';
import { processTemplateDir, copyDir } from './template-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

/**
 * Scaffold a project using Angular CLI, then overlay sakai-ng layout + Osmosys customizations.
 */
export async function scaffold(options) {
  const outputDir = resolve(options.output);

  if (existsSync(outputDir)) {
    throw new Error(`Directory already exists: ${outputDir}`);
  }

  const templateData = {
    name: options.name,
    displayName: options.displayName,
    prefix: options.prefix,
    description: options.description,
    port: options.port,
    apiUrl: options.apiUrl,
    auth: options.auth,
  };

  // 1. Run ng new (handles angular.json, tsconfig, tailwind, favicon, git init, npm install)
  console.log(chalk.dim('  Running Angular CLI...'));
  runNgNew(options);
  console.log(chalk.green('  ✔ Angular project created'));

  // 2. Clean up ng-generated files we replace
  cleanupNgFiles(outputDir);

  // 3. Modify ng-generated configs
  console.log(chalk.dim('  Configuring project...'));
  patchAngularJson(outputDir, options);
  patchTsConfig(outputDir);
  patchPackageJson(outputDir, options);
  patchIndexHtml(outputDir, options);
  console.log(chalk.green('  ✔ Configuration updated'));

  // 4. Copy base template files (sakai layout SCSS + components, dashboard, shared, etc.)
  const baseDir = join(TEMPLATES_DIR, 'base');

  if (existsSync(baseDir)) {
    copyDir(baseDir, outputDir);
  }

  // 5. Copy conditional templates (auth layer)
  if (options.auth) {
    const authDir = join(TEMPLATES_DIR, 'conditional', 'auth');

    if (existsSync(authDir)) {
      copyDir(authDir, outputDir);
    }
  }

  // 6. Process EJS templates (app.config, app.routes, topbar, footer, CLAUDE.md, etc.)
  const ejsDir = join(TEMPLATES_DIR, 'ejs');

  if (existsSync(ejsDir)) {
    processTemplateDir(ejsDir, outputDir, templateData);
  }

  // 7. Copy AI config (skills, agents, mcp.json)
  const aiDir = join(TEMPLATES_DIR, 'ai-config');

  if (existsSync(aiDir)) {
    processTemplateDir(aiDir, outputDir, templateData);
  }

  // 8. Merge CLAUDE.md — append ng-generated Angular best practices to our CLAUDE.md
  mergeCLAUDEmd(outputDir);

  // 9. Merge MCP config — add primeng + context7 to ng-generated angular-cli MCP
  mergeMcpJson(outputDir);

  // 10. Install additional dependencies
  console.log(chalk.dim('  Installing additional dependencies...'));
  installExtraDeps(outputDir);
  console.log(chalk.green('  ✔ Additional dependencies installed'));

  // 11. Create a commit with all customizations
  console.log(chalk.dim('  Committing customizations...'));
  commitCustomizations(outputDir);
  console.log(chalk.green('  ✔ Customizations committed'));

  // 12. Print post-generation cleanup checklist
  printCleanupChecklist(options);
}

/**
 * Print post-generation cleanup checklist.
 */
function printCleanupChecklist(options) {
  console.log('');
  console.log(chalk.green.bold('Project generated successfully!'));
  console.log('');
  console.log(chalk.bold('Next steps — customize your project:'));
  console.log('');
  console.log(`  1. ${chalk.cyan('Replace the logo')}: update src/app/layout/component/app.topbar.ts`);
  console.log(`  2. ${chalk.cyan('Update favicon')}: replace public/favicon.ico`);
  console.log(`  3. ${chalk.cyan('Configure auth')}: update src/app/core/services/auth.service.ts`);
  console.log(`  4. ${chalk.cyan('Update profile page')}: src/app/features/profile/`);
  console.log(`  5. ${chalk.cyan('Remove demo credentials')}: check login page for placeholder values`);
  console.log(`  6. ${chalk.cyan('Set API URL')}: update src/environments/environment.ts`);
  console.log(`  7. ${chalk.cyan('Update CLAUDE.md')}: add project-specific context`);
  console.log(`  8. ${chalk.cyan('Generate API types')}: npm run generate:api (after backend is ready)`);
  console.log('');
  console.log(chalk.dim('  Tip: Feed CLEANUP.md to Claude Code for AI-assisted cleanup'));
  console.log('');
  console.log(chalk.bold('To start developing:'));
  console.log('');
  console.log(`  cd ${options.output}`);
  console.log('  npm start');
  console.log('');
}

/**
 * Remove ng-generated files that our templates replace.
 */
function cleanupNgFiles(outputDir) {
  const toRemove = [
    'src/styles.css',       // Replaced by src/assets/styles.scss + src/assets/tailwind.css
    'src/app/app.css',      // We use SCSS
    'src/app/app.html',     // Replaced by our router-outlet template
    'src/app/app.spec.ts',  // Not needed for scaffold
    'README.md',            // Our CLAUDE.md is the primary doc
  ];

  for (const file of toRemove) {
    const filePath = join(outputDir, file);

    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}

/**
 * Run `npx @angular/cli@21 new` to scaffold the base project.
 */
function runNgNew(options) {
  const outputDir = resolve(options.output);
  const parentDir = dirname(outputDir);
  const dirName = outputDir.split('/').pop();

  const args = [
    '@angular/cli@21', 'new', options.name,
    '--style=tailwind',
    '--ssr=false',
    '--ai-config=claude',
    `--prefix=${options.prefix}`,
    `--directory=${dirName}`,
  ];

  execFileSync('npx', args, {
    cwd: parentDir,
    stdio: 'pipe',
    timeout: 120000,
  });
}

/**
 * Patch angular.json: styles array, schematics, budgets, lint target, fileReplacements.
 */
function patchAngularJson(outputDir, options) {
  const filePath = join(outputDir, 'angular.json');
  const config = JSON.parse(readFileSync(filePath, 'utf-8'));
  const projectName = options.name;
  const project = config.projects[projectName];

  // Add SCSS schematics for component generation
  project.schematics = {
    '@schematics/angular:component': {
      style: 'scss',
    },
  };

  // Update build options
  const buildOptions = project.architect.build.options;

  // Change styles to sakai-ng pattern
  buildOptions.styles = [
    'src/assets/styles.scss',
    'src/assets/tailwind.css',
  ];

  // Add inlineStyleLanguage for SCSS support in components
  buildOptions.inlineStyleLanguage = 'scss';

  // Add production file replacements
  const prodConfig = project.architect.build.configurations.production;
  prodConfig.fileReplacements = [
    {
      replace: 'src/environments/environment.ts',
      with: 'src/environments/environment.production.ts',
    },
  ];

  // Increase budgets (sakai-ng uses 1mb/5mb)
  prodConfig.budgets = [
    { type: 'initial', maximumWarning: '1MB', maximumError: '5MB' },
    { type: 'anyComponentStyle', maximumWarning: '4kB', maximumError: '8kB' },
  ];

  // Add lint target
  project.architect.lint = {
    builder: '@angular-eslint/builder:lint',
    options: {
      lintFilePatterns: ['src/**/*.ts', 'src/**/*.html'],
    },
  };

  // Add schematicCollections for angular-eslint
  config.cli = config.cli || {};
  config.cli.schematicCollections = ['angular-eslint'];

  writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/**
 * Patch package.json: add custom scripts.
 */
function patchPackageJson(outputDir, options) {
  const filePath = join(outputDir, 'package.json');
  const pkg = JSON.parse(readFileSync(filePath, 'utf-8'));

  pkg.description = options.description;

  // Add/update scripts
  Object.assign(pkg.scripts, {
    start: `ng serve --port ${options.port}`,
    'build:prod': 'ng build --configuration production',
    lint: "eslint . --max-warnings=0 --ignore-pattern '.angular/**'",
    'lint:fix': "eslint . --fix --ignore-pattern '.angular/**'",
    'prettier-format': 'prettier --write "**/*.{js,ts,html,scss,json}"',
    'lint-fix-format': 'npm run prettier-format && npm run lint:fix && npm run prettier-format',
    'generate:api': `openapi-typescript ${options.apiUrl}/api/docs-json -o src/app/core/types/api.types.ts`,
    'i18n:extract': 'ng extract-i18n --output-path src/locale',
    prepare: 'husky',
  });

  // Add lint-staged config
  pkg['lint-staged'] = {
    '*.{ts,html}': ['prettier --write'],
    '*.{js,scss,json}': ['prettier --write'],
  };

  writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

/**
 * Patch tsconfig.json: add @/ path alias and baseUrl.
 */
function patchTsConfig(outputDir) {
  const filePath = join(outputDir, 'tsconfig.json');
  const raw = readFileSync(filePath, 'utf-8');

  // Parse JSON with comments (strip comments first)
  const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
  const config = JSON.parse(stripped);

  config.compilerOptions.baseUrl = './';
  config.compilerOptions.paths = {
    '@/*': ['src/*'],
  };

  writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/**
 * Patch index.html: add Lato font CDN link.
 */
function patchIndexHtml(outputDir, options) {
  const filePath = join(outputDir, 'src', 'index.html');
  let html = readFileSync(filePath, 'utf-8');

  // Update title
  html = html.replace(
    /<title>.*<\/title>/,
    `<title>${options.displayName}</title>`,
  );

  // Update root selector to match prefix
  html = html.replace(
    /<app-root><\/app-root>/,
    `<${options.prefix}-root></${options.prefix}-root>`,
  );

  writeFileSync(filePath, html, 'utf-8');
}

/**
 * Merge ng-generated CLAUDE.md (Angular best practices) into our CLAUDE.md.
 * Our EJS template is written to the root CLAUDE.md.
 * The ng-generated one is at .claude/CLAUDE.md.
 */
function mergeCLAUDEmd(outputDir) {
  const ngClaude = join(outputDir, '.claude', 'CLAUDE.md');
  const rootClaude = join(outputDir, 'CLAUDE.md');

  if (existsSync(ngClaude) && existsSync(rootClaude)) {
    const ngContent = readFileSync(ngClaude, 'utf-8');
    const rootContent = readFileSync(rootClaude, 'utf-8');

    // Append Angular best practices from ng-generated file to our CLAUDE.md
    const merged = rootContent.trimEnd() + '\n\n## Angular Best Practices (from Angular CLI)\n\n' + ngContent.trim() + '\n';
    writeFileSync(rootClaude, merged, 'utf-8');

    // Also keep .claude/CLAUDE.md as-is (Angular CLI puts it there)
  }
}

/**
 * Merge MCP configs: ng-generated .vscode/mcp.json has angular-cli,
 * our mcp.json template may have primeng + context7.
 */
function mergeMcpJson(outputDir) {
  const vscodeMcp = join(outputDir, '.vscode', 'mcp.json');
  const rootMcp = join(outputDir, 'mcp.json');

  // If we have a root mcp.json (from ai-config template), merge it into .vscode/mcp.json
  if (existsSync(rootMcp) && existsSync(vscodeMcp)) {
    // Read both, but .vscode/mcp.json may have comments
    const rootConfig = JSON.parse(readFileSync(rootMcp, 'utf-8'));

    // Read vscode mcp.json, strip comments
    const vscodeRaw = readFileSync(vscodeMcp, 'utf-8');
    const vscodeStripped = vscodeRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    const vscodeConfig = JSON.parse(vscodeStripped);

    // Merge servers
    vscodeConfig.servers = {
      ...vscodeConfig.servers,
      ...rootConfig.servers,
    };

    writeFileSync(vscodeMcp, JSON.stringify(vscodeConfig, null, 2) + '\n', 'utf-8');

    // Remove the root mcp.json (no longer needed)
    unlinkSync(rootMcp);
  }
}

/**
 * Install PrimeNG ecosystem and dev tool dependencies.
 */
function installExtraDeps(outputDir) {
  const deps = [
    '@angular/animations',
    '@primeuix/themes',
    'chart.js',
    'openapi-fetch',
    'primeicons',
    'primeng',
    'tailwindcss-primeui',
  ];

  const devDeps = [
    'angular-eslint',
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'husky',
    'lint-staged',
    'openapi-typescript',
    'typescript-eslint',
  ];

  execFileSync('npm', ['install', ...deps], {
    cwd: outputDir,
    stdio: 'pipe',
    timeout: 120000,
  });

  execFileSync('npm', ['install', '--save-dev', ...devDeps], {
    cwd: outputDir,
    stdio: 'pipe',
    timeout: 120000,
  });
}

/**
 * Commit all overlay customizations.
 */
function commitCustomizations(outputDir) {
  try {
    execFileSync('git', ['add', '-A'], { cwd: outputDir, stdio: 'pipe' });
    execFileSync(
      'git',
      ['commit', '-m', 'feat: add sakai-ng layout, PrimeNG, and Osmosys customizations'],
      { cwd: outputDir, stdio: 'pipe' },
    );
  } catch {
    // If commit fails (e.g., nothing to commit), that's ok
  }
}
