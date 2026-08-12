import * as dotenv from "dotenv";
import * as path from "path";
import { validateWorkerEnv } from "./env.schema";

dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  validateWorkerEnv();
  await NestFactory.createApplicationContext(AppModule);
  console.log("Worker is running...");
}

bootstrap().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
