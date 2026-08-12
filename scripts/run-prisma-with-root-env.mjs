import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env');
const prismaArgs = process.argv.slice(2);

if (!prismaArgs.length) {
    console.error('Missing Prisma arguments.');
    process.exit(1);
}

function parseEnvFile(content) {
    const parsed = {};

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }

        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        parsed[key] = value;
    }

    return parsed;
}

const envFromFile = existsSync(envPath)
    ? parseEnvFile(readFileSync(envPath, 'utf8'))
    : {};

const prismaBin = resolve(rootDir, 'node_modules', 'prisma', 'build', 'index.js');
const child = spawn(process.execPath, [prismaBin, ...prismaArgs], {
    cwd: resolve(rootDir, 'packages', 'db'),
    stdio: 'inherit',
    env: {
        ...process.env,
        ...envFromFile,
    },
});

child.on('exit', (code) => {
    process.exit(code ?? 0);
});
