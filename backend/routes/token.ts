import { createToken } from "../utils/token.ts";

/**
 * HTTP handler for generating LiveKit access tokens
 * Expects POST body: { identity: string, room: string }
 * Returns: { token: string }
 */
export async function tokenHandler(req: Request) {
  try {
    const { identity, room } = await req.json();

    if (!identity) {
      throw new Error("Identity is required");
    }

    const jwt = await createToken(identity, room ?? "default");

    return new Response(JSON.stringify({ token: jwt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Token creation error:", error);
    throw error;
  }
}
