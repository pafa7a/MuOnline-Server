import { DataSource } from "typeorm";
import path from "path";

const dbPath = path.join(__dirname, '..', 'database', 'MuOnline.db');

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: dbPath,
  synchronize: true,
  logging: false,
  entities: [path.join(__dirname, '../database/entities/**/*.{ts,js}')],
  subscribers: [],
});

export const initDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
};
