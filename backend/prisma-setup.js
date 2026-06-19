import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');

const dbUrl = process.env.DATABASE_URL || '';
const usePostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || process.env.NODE_ENV === 'production';

let schema = fs.readFileSync(schemaPath, 'utf8');

if (usePostgres) {
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  schema = schema.replace(/url\s*=\s*"file:[^"]*"/g, 'url = env("DATABASE_URL")');
  console.log('[Prisma Setup] Using PostgreSQL provider.');
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url = "file:../aerosync.db"');
  console.log('[Prisma Setup] No PostgreSQL URL found. Using SQLite provider for local development.');
}

fs.writeFileSync(schemaPath, schema, 'utf8');

try {
  console.log('[Prisma Setup] Generating client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.error('[Prisma Setup] Generation failed:', e.message);
}
