import app from "./app";
import { logger } from "./lib/logger";
import { startBot } from "./bot";

const port = Number(process.env["PORT"]);
app.listen(port, () => logger.info({ port }, "Server listening"));

startBot().catch(err => {
  logger.error({ err }, "Discord bot failed to start");
  process.exit(1);
});
