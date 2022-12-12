import pg from "pg";
import "dotenv/config";
import { PgConnector } from "drizzle-orm-pg";

export type config = {
  PORT_APP: number;
  USER_PSQL: string;
  HOST_PSQL: string;
  DB_PSQL: string;
  PASSWORD_PSQL: string;
  PORT_PSQL: number;
};

const pool = new pg.Pool({
  user: process.env.USER_PSQL,
  host: process.env.HOST_PSQL,
  database: process.env.DB_PSQL,
  password: process.env.PASSWORD_PSQL,
  port: 5432,
});

export const db = new PgConnector(pool);
