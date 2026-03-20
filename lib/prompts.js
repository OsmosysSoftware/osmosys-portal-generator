import { input, confirm } from '@inquirer/prompts';

/**
 * Prompt for any missing options interactively.
 * CLI flags take precedence over prompts.
 * When --name is provided, all other fields use defaults without prompting.
 */
export async function promptForOptions(cliOpts) {
  const hasName = !!cliOpts.name;

  const name =
    cliOpts.name ||
    (await input({
      message: 'Project name (kebab-case):',
      validate: (v) => (/^[a-z][a-z0-9-]*$/.test(v) ? true : 'Must be kebab-case (e.g., acme-portal)'),
    }));

  const displayName =
    cliOpts.displayName ||
    (hasName
      ? toDisplayName(name)
      : await input({
          message: 'Display name:',
          default: toDisplayName(name),
        }));

  const prefix =
    cliOpts.prefix ||
    (hasName
      ? 'app'
      : await input({
          message: 'Component prefix:',
          default: 'app',
          validate: (v) => (/^[a-z][a-z0-9]*$/.test(v) ? true : 'Must be lowercase alphanumeric'),
        }));

  const description =
    cliOpts.description ||
    (hasName
      ? 'Angular portal'
      : await input({
          message: 'Project description:',
          default: 'Angular portal',
        }));

  const port =
    cliOpts.port ||
    (hasName
      ? '4200'
      : await input({
          message: 'Dev server port:',
          default: '4200',
          validate: (v) => (/^\d{4,5}$/.test(v) ? true : 'Must be a valid port number'),
        }));

  const apiUrl =
    cliOpts.apiUrl ||
    (hasName
      ? 'http://localhost:3000'
      : await input({
          message: 'Backend API URL (dev):',
          default: 'http://localhost:3000',
        }));

  const auth = cliOpts.auth !== undefined ? cliOpts.auth : hasName ? true : await confirm({ message: 'Include auth layer (JWT, guards, interceptors)?', default: true });

  const output = cliOpts.output || `./${name}`;

  return {
    name,
    displayName,
    prefix,
    description,
    port,
    apiUrl,
    auth,
    output,
  };
}

function toDisplayName(kebab) {
  return kebab
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
