#!/usr/bin/env node

import { Command } from 'commander';
import { promptForOptions } from '../lib/prompts.js';
import { scaffold } from '../lib/scaffold.js';
import { postScaffold } from '../lib/post-scaffold.js';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('osmosys-portal')
  .description('Scaffold a production-ready Angular portal with Osmosys standards')
  .version(pkg.version)
  .option('--name <name>', 'Project name (kebab-case)')
  .option('--display-name <displayName>', 'Display name (derived from name if omitted)')
  .option('--prefix <prefix>', 'Angular component prefix', 'app')
  .option('--description <description>', 'Project description', 'Angular portal')
  .option('--port <port>', 'Dev server port', '4200')
  .option('--api-url <apiUrl>', 'Backend API URL for development', 'http://localhost:3000')
  .option('--no-auth', 'Skip auth layer (JWT, guards, interceptors)')
  .option('--output <dir>', 'Output directory (defaults to ./<name>)')
  .action(async (opts) => {
    console.log(chalk.bold.cyan('\n  Osmosys Angular Portal Generator\n'));

    try {
      const options = await promptForOptions(opts);

      console.log(chalk.dim('\n  Scaffolding project...\n'));
      await scaffold(options);

      await postScaffold(options);

      console.log(chalk.bold.green('\n  ✔ Project created successfully!\n'));
      printNextSteps(options);
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        console.log(chalk.dim('\n  Cancelled.\n'));
        process.exit(0);
      }

      console.error(chalk.red(`\n  Error: ${error.message}\n`));
      process.exit(1);
    }
  });

function printNextSteps(options) {
  const dir = options.output;
  console.log(chalk.bold('  Next steps:\n'));
  console.log(`    cd ${dir}`);
  console.log('    npm start');
  console.log('');
  console.log(chalk.dim('  Available commands:'));
  console.log(chalk.dim('    npm start              Dev server'));
  console.log(chalk.dim('    npm run build           Production build'));
  console.log(chalk.dim('    npm run lint            ESLint check'));
  console.log(chalk.dim('    npm run generate:api    Regenerate API types'));
  console.log('');
  console.log(chalk.dim('  AI tooling included:'));
  console.log(chalk.dim('    CLAUDE.md              Claude Code instructions'));
  console.log(chalk.dim('    .claude/skills/        CRUD page generator, code-quality, etc.'));
  console.log(chalk.dim('    .claude/agents/        Code reviewer subagent'));
  console.log(chalk.dim('    .vscode/mcp.json       MCP servers (angular-cli, primeng, context7)'));
  console.log('');
}

program.parse();
