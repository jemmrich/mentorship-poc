import { Room, RoomEvent, Track } from "livekit-client";

// Configuration - Use HTTPS for all services (Caddy proxies LiveKit with TLS)
const backendUrl = `https://192.168.2.65:3001/token`;
const livekitUrl = `wss://192.168.2.65:7880`;

// DOM elements
const joinBtn = document.getElementById("joinBtn")! as HTMLButtonElement;
const leaveBtn = document.getElementById("leaveBtn")! as HTMLButtonElement;
const username = document.getElementById("username") as HTMLInputElement;
const statusDiv = document.getElementById("status")!;
const participantsDiv = document.getElementById("participants")!;
const remoteName = document.getElementById("remoteName")!;

// Room instance (singleton)
let room: Room | null = null;

// Update UI status
function updateStatus(status: "connected" | "disconnected", message: string) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${status}`;
}

// Update participant count
function updateParticipants() {
  if (!room) {
    participantsDiv.textContent = "";
    return;
  }
  
  const count = room.numParticipants;
  participantsDiv.textContent = `👥 ${count} participant${count !== 1 ? "s" : ""} in room`;
  
  // Update remote video label
  const remoteParticipants = Array.from(room.remoteParticipants.values());
  if (remoteParticipants.length > 0) {
    remoteName.textContent = remoteParticipants[0].identity;
  } else {
    remoteName.textContent = "Waiting for participant...";
  }
}

// Join button handler
joinBtn.onclick = async () => {
  // Prevent multiple connections
  if (room) {
    console.log("Already connected to room");
    return;
  }

  const identity = username.value.trim();
  if (!identity) {
    alert("Please enter a username");
    return;
  }

  try {
    updateStatus("disconnected", "Connecting...");
    console.log(`Connecting as: ${identity}`);
    
    const token = await getToken(identity, "testroom");
    room = new Room();
    
    // Event: Remote track subscribed (video or audio from other participants)
    room.on(RoomEvent.TrackSubscribed, (_track, pub, participant) => {
      console.log(`Track subscribed from ${participant.identity}: ${pub.kind}`);
      
      if (pub.kind === "video") {
        const videoEl = document.getElementById("remoteVideo") as HTMLVideoElement;
        pub.track.attach(videoEl);
      } else if (pub.kind === "audio") {
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
        pub.track.attach(audioEl);
      }
      
      updateParticipants();
    });

    // Event: Participant joined
    room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log(`Participant connected: ${participant.identity}`);
      updateParticipants();
    });

    // Event: Participant left
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log(`Participant disconnected: ${participant.identity}`);
      updateParticipants();
    });

    // Event: Disconnected from room
    room.on(RoomEvent.Disconnected, () => {
      console.log("Disconnected from room");
      room = null;
      updateStatus("disconnected", "Disconnected");
      updateParticipants();
      joinBtn.disabled = false;
      leaveBtn.disabled = true;
      username.disabled = false;
    });

    // Connect to LiveKit room
    await room.connect(livekitUrl, token);
    console.log("Connected to room");

    // Enable local camera and microphone
    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;

    try {
      // Check if mediaDevices is available (requires HTTPS or localhost)
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia not available. Ensure you're using HTTPS.");
      }

      await room.localParticipant.enableCameraAndMicrophone();
      const cameraPub = room.localParticipant.getTrackPublication(Track.Source.Camera);

      if (cameraPub?.track) {
        cameraPub.track.attach(localVideo);
      }

      updateStatus("connected", "✓ Connected");
      updateParticipants();
      joinBtn.disabled = true;
      leaveBtn.disabled = false;
      username.disabled = true;
    } catch (error) {
      console.error("Failed to enable camera/microphone:", error);
      alert("Camera/microphone access denied. Please check your browser permissions.");
      await room.disconnect();
    }
  } catch (error) {
    console.error("Failed to join room:", error);
    alert("Failed to join room. Please try again.");
    room = null;
    updateStatus("disconnected", "Connection failed");
  }
};

// Leave button handler
leaveBtn.onclick = async () => {
  if (room) {
    await room.disconnect();
    console.log("Left room");
  }
};

// Get access token from backend
async function getToken(identity: string, room: string) {
  const res = await fetch(backendUrl, {
    method: "POST",
    body: JSON.stringify({ identity, room }),
  });

  const data = await res.json();
  return data.token;
}

// Initialize status
updateStatus("disconnected", "Disconnected");

