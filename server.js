import express from "express";
import http from "http";
import dotenv from "dotenv";
import { PORT } from "./env.js";
import dbConnect from "./db/connect.js";
import app from "./app.js";
import chalk from "chalk";

// const app = express();

dotenv.config();
const server = http.createServer(app);
app.set("port", PORT);
server.listen(PORT, async () => {
  console.log(chalk.blue.bold(`Server running at port ${PORT}`));
  await dbConnect();
});
