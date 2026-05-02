import express, { Application, Request, Response } from "express";
import cors from "cors";
import passport from "./config/passport";
import cookieParser from "cookie-parser";

import router from "./routes";
import dotenv from "dotenv";
import { globalErrorHandler, notFound } from "./middlewares/error.middleware";

dotenv.config();
const app: Application = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// application routes
app.use("/api", router);

//404
app.use(notFound);

//global error handler
app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! This is the Express server running with TypeScript.");
});

export default app;
