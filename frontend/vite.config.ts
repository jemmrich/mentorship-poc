import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../certs/192.168.2.65-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../certs/192.168.2.65.pem")),
    },
  }
});
