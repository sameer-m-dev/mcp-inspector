#!/usr/bin/env node

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import handler from "serve-handler";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");

const server = http.createServer((request, response) => {
  // BOLTIC: Change
  // Health check endpoints
  if (request.url.pathname === '/_healthz' || request.url.pathname === '/_readyz') {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, max-age=0'
    });
    response.end(JSON.stringify({ ok: "ok" }));
    return;
  }

  const handlerOptions = {
    public: distPath,
    rewrites: [{ source: "/**", destination: "/index.html" }],
    headers: [
      {
        // Ensure index.html is never cached
        source: "index.html",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, max-age=0",
          },
        ],
      },
      {
        // Allow long-term caching for hashed assets
        source: "assets/**",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ],
  };

  return handler(request, response, handlerOptions);
});

const port = process.env.PORT || 6274;
const host = process.env.HOST || "0.0.0.0";
server.on("listening", () => {
  console.log(
    `MCP Inspector is up and running at http://${host}:${port} 🚀`,
  );
});
server.on("error", (err) => {
  if (err.message.includes(`EADDRINUSE`)) {
    console.error(
      `MCP Inspector PORT IS IN USE at http://${host}:${port} ❌ `,
    );
  } else {
    throw err;
  }
});
server.listen(port, host);
