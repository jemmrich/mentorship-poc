import { serveTls } from "./deps.ts";
import { PORT } from "./env.ts";
import { tokenHandler } from "./routes/token.ts";

console.log(`Backend running on https://0.0.0.0:${PORT}`);

// CORS headers to allow frontend access from any origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Start HTTPS server with self-signed certificates
serveTls(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Token generation endpoint for LiveKit authentication
  if (req.method === "POST" && req.url.endsWith("/token")) {
    try {
      const response = await tokenHandler(req);
      // Add CORS headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      return new Response(response.body, { status: response.status, headers: newHeaders });
    } catch (error) {
      console.error("Token handler error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
  return new Response("OK");
}, { 
  hostname: "0.0.0.0",
  port: PORT,
  certFile: "../certs/cert.pem",
  keyFile: "../certs/cert-key.pem",
});
