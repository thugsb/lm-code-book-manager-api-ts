import { Dialect, Sequelize } from "sequelize";

export let sequelize = new Sequelize("sqlite::memory:");

const {
	DB_NAME,
	DB_USERNAME,
	DB_PASSWORD,
	DB_HOST,
	DB_DIALECT,
	DB_PORT,
	NODE_ENV,
} = process.env;

if (NODE_ENV !== "test") {
	sequelize = new Sequelize(
		DB_NAME ?? "MISSING_DB_NAME_CONFIG",

		DB_USERNAME ?? "MISSING_DB_USERNAME_CONFIG",

		DB_PASSWORD ?? "MISSING_DB_PASSWORD_CONFIG",
		{
			host: DB_HOST ?? "MISSING_DB_HOST_CONFIG",
			port: parseInt(DB_PORT as string) ?? "MISSING_DB_PORT_CONFIG",
			dialect: (DB_DIALECT as Dialect) ?? "postgres",
		}
	);
}
