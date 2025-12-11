import { config } from "./deps.ts";

// Load environment variables from .env file
const env = await config({ export: true });

// LiveKit API credentials for token generation
export const API_KEY = env.LIVEKIT_API_KEY;
export const API_SECRET = env.LIVEKIT_API_SECRET;

// Backend server configuration
export const PORT = Number(env.BACKEND_PORT ?? 3001);
