import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth/auth.routes.mjs";
;
import { errorHandler } from "./middleware/error-handler.mjs";
import documentRoutes from "./routes/document.routes.mjs";
const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "20kb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});


app.use("/api/auth", authRoutes);
app.use(
  "/api/documents",
  documentRoutes
);




app.use(errorHandler);

export default app;