import pg from "pg";
import "dotenv/config";

const { Client } = pg;
export type config = {
  PORT_APP: number;
  USER_PSQL: string;
  HOST_PSQL: string;
  DB_PSQL: string;
  PASSWORD_PSQL: string;
  PORT_PSQL: number;
};

const dbConn = (): pg.Client => {
  const client = new Client({
    user: process.env.USER_PSQL,
    host: process.env.HOST_PSQL,
    database: process.env.DB_PSQL,
    password: process.env.PASSWORD_PSQL,
    port: 5432,
  });
  client.connect((err) => {
    if (err) throw err;
  });
  return client;
};

export default dbConn;
