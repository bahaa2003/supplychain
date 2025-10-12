import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/db.js";
import http from "http";
import { initRealtime } from "./sockets/index.js";

connectDB();

const PORT = process.env.PORT || 3000;
export const server = http.createServer(app);
initRealtime(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
