declare namespace NodeJS {
  export interface ProcessEnv {
    PORT_APP: number;
    USER_PSQL: string;
    HOST_PSQL: string;
    DB_PSQL: string;
    PASSWORD_PSQL: string;
    PORT_PSQL: number;
    JWT_SECRET: string;
    JWT_SECRET_CLIENTS: string;
    JWT_EXPIRES_IN: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    BUCKET_NAME_S3: string;
    TELEGRAM_BOT_TOKEN: string;
    DEV_URL: string;
    STRIPE_SECRET: string;
    CHAT_ID_TG_BOT: string;
  }
}
