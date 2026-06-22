import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envFiles = ['.env.local', '.env'];

for (const fileName of envFiles) {
  const envPath = path.resolve(process.cwd(), fileName);

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
