import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';

/**
 * Run post-scaffold steps: husky setup.
 * Note: git init and npm install are handled by ng new and scaffold.js.
 */
export async function postScaffold(options) {
  const cwd = resolve(options.output);

  // Setup husky for pre-commit hooks
  try {
    console.log(chalk.dim('  Setting up Husky...'));
    execFileSync('npx', ['husky', 'init'], { cwd, stdio: 'pipe' });

    // Replace default "npm test" hook with lint-staged
    writeFileSync(join(cwd, '.husky', 'pre-commit'), 'npx lint-staged\n');

    execFileSync('git', ['add', '-A'], { cwd, stdio: 'pipe' });
    execFileSync(
      'git',
      ['commit', '-m', 'chore: configure husky pre-commit hooks'],
      { cwd, stdio: 'pipe' },
    );
    console.log(chalk.green('  ✔ Husky pre-commit hooks configured'));
  } catch {
    console.log(chalk.yellow('  ⚠ Husky setup failed — run npx husky init manually'));
  }
}
