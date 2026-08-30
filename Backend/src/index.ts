import app from "./app.js";
import { env } from "./config/env.config.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `Server running on port ${env.PORT}`,
  );
});

export default server;