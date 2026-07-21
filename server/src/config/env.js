import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'jibuen-secret-key-change-in-production',
  jwtExpires: '7d',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../../database/data.db'),
};
