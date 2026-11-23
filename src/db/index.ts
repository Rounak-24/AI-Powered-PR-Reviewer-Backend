import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

const dbUrl = process.env.DATABASE_URL as string

neonConfig.webSocketConstructor = ws

export const pool = new Pool({connectionString:dbUrl})

export const db = drizzle({client:pool})