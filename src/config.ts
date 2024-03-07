import * as dotenv from "dotenv";

dotenv.config({
	path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

const {
	PORT,
	DB_NAME,
	DB_USERNAME,
	DB_PASSWORD,
	DB_HOST,
	DB_DIALECT,
	DB_PORT,
} = process.env;

export const CONFIG = {
	port: PORT ?? 3000,
	dbName: DB_NAME ?? "sqlite::memory:",
	dbUserName: DB_USERNAME ?? "",
	dbPassword: DB_PASSWORD ?? "",
	dbHost: DB_HOST ?? "localhost",
	dbDialect: DB_DIALECT ?? "sqlite",
	dbPort: DB_PORT ?? "5432",
} as const;
