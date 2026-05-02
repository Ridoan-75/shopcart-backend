import "dotenv/config";
import dotenv from "dotenv";
import app from "./app";
import { env } from './config/env';
import { db } from "./config/db";

 dotenv.config();

async function main() {
  try {
    await db.$connect();
    console.log("✅ Database connected");

    app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

main();
