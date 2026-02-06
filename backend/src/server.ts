import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./config/database.js";
import userSessionsRouter from "./routes/userSessions.js";
import valueEvolutionRouter from "./routes/valueEvolution.js";
import apaReorderingsRouter from "./routes/apaReorderings.js";
import finalDecisionsRouter from "./routes/finalDecisions.js";
import sessionMetricsRouter from "./routes/sessionMetrics.js";
import sessionFeedbackRouter from "./routes/sessionFeedback.js";
import valueStabilityRouter from "./routes/valueStability.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT || 4002);
const BASE_PATH = "/VRDS_CVR";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(cors({
  origin: [
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "https://moonlander.fit.edu",
    "http://moonlander.fit.edu"
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

app.get(`${BASE_PATH}/api/health`, (_req, res) => {
  res.json({ message: "Wildfire Study API", base: `${BASE_PATH}/api`, env: NODE_ENV });
});

app.use(`${BASE_PATH}/api/user-sessions`, userSessionsRouter);
app.use(`${BASE_PATH}/api/value-evolution`, valueEvolutionRouter);
app.use(`${BASE_PATH}/api/apa-reorderings`, apaReorderingsRouter);
app.use(`${BASE_PATH}/api/final-decisions`, finalDecisionsRouter);
app.use(`${BASE_PATH}/api/session-metrics`, sessionMetricsRouter);
app.use(`${BASE_PATH}/api/session-feedback`, sessionFeedbackRouter);
app.use(`${BASE_PATH}/api/value-stability`, valueStabilityRouter);

if (NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "..", "..", "dist", "client");

  app.use(BASE_PATH, express.static(clientPath));

  app.get(`${BASE_PATH}/*`, (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 API on http://localhost:${PORT}${BASE_PATH}`);
    console.log(`📦 Environment: ${NODE_ENV}`);
    if (NODE_ENV === "production") {
      console.log(`🌐 Serving static files from dist/client at ${BASE_PATH}`);
    }
  });
}

start();
