import { AccessToken } from "../deps.ts";
import { API_KEY, API_SECRET } from "../env.ts";

/**
 * Creates a JWT token for LiveKit authentication
 * @param identity - Unique identifier for the participant
 * @param room - Name of the room to join
 * @returns JWT token string
 */
export function createToken(identity: string, room: string) {
  // Create access token with participant identity
  const at = new AccessToken(API_KEY, API_SECRET, { identity });
  
  // Grant permission to join the specified room
  at.addGrant({ roomJoin: true, room });

  // Return signed JWT token
  return at.toJwt();
}
