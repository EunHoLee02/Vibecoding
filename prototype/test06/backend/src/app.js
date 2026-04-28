import cors from "cors";
import express from "express";
import { prototypeRouter } from "./routes/prototypeRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:3002", "http://127.0.0.1:3002"],
    }),
  );
  app.use(express.json());

  app.use("/api", prototypeRouter);

  app.use((_, response) => {
    response.status(404).json({
      success: false,
      data: null,
      error: {
        code: "NOT_FOUND",
        message: "요청한 경로를 찾지 못했습니다.",
      },
    });
  });

  return app;
}
