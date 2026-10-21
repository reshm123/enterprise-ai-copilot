import "dotenv/config";

import app from "./app.mjs";
import { connectDatabase } from "./config/database.mjs";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    function shutdown() {
      server.close(() => {
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();