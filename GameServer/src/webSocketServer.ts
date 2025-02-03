import WebSocket, { WebSocketServer } from "ws";
import { PlayerPositions, Wrapper, PlayerPositionData, PlayerJoined, PlayerDisconnected } from "@/messages/gameserver";
import { IncomingMessage } from "http";
import { getConnectedPlayerOSType, getConnectedPlayerOSVersion } from "@/helpers/connectHelpers";
import { getConfig } from "@/helpers/configHelpers";
import { getAllHandlers } from "@/helpers/getAllHandlers";
import { randomBytes } from "crypto";

interface ConnectedClient {
  ws: WebSocket;
  remoteAddress: String;
  remotePort: Number;
  osType: String;
  osVersion: String;
}

interface PlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isInWorld: Boolean;
  connectedClient: ConnectedClient;
}

export const connectedClients = new Set<ConnectedClient>();
export const playerStates: Map<string, PlayerState> = new Map();
export const wsToPlayerId: Map<WebSocket, string> = new Map();


interface ExtendedWebSocketServer extends WebSocketServer {
  broadcast: (msg: Uint8Array<ArrayBufferLike>) => void;
  broadcastExceptSender: (msg: Uint8Array<ArrayBufferLike>, sender: WebSocket) => void;
}

export let wss: ExtendedWebSocketServer;

export const initWebSocketServer = () => {
  const handlers = getAllHandlers();
  const PORT = getConfig('common', 'port');
  wss = new WebSocketServer({ port: PORT }) as ExtendedWebSocketServer;

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const originalSend = ws.send;
    ws.send = function (data: any, ...args: any[]) {
      try {
        console.log(`GS->C: ${Wrapper.decode(data).type}`);
        const options = args[0] || {};
        const cb = args[1] || (() => { });
        originalSend.apply(this, [data, options, cb]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    };

    const connectedClient: ConnectedClient = {
      ws,
      remoteAddress: req.socket.remoteAddress || "",
      remotePort: req.socket.remotePort || 0,
      osType: getConnectedPlayerOSType(req.headers),
      osVersion: getConnectedPlayerOSVersion(req.headers)
    };
    connectedClients.add(connectedClient);

    function createRandomString(length: number) {
      return randomBytes(length / 2).toString("hex");
    }

    // Initialize player state
    const playerId = createRandomString(5);

    // Map the WebSocket to the player ID
    wsToPlayerId.set(ws, playerId);

    const initialPlayerState: PlayerState = {
      id: playerId.toString(),
      position: { x: 125, y: 0, z: 125 },
      rotation: { x: 0, y: 0, z: 0 },
      isInWorld: false,
      connectedClient,
    };

    const otherPlayers = Array.from(playerStates.values())
      .filter(playerState => playerState.isInWorld)
      .map(playerState => ({
        id: playerState.id.toString(),
        x: playerState.position.x,
        y: playerState.position.y,
        z: playerState.position.z,
        rotationX: playerState.rotation.x,
        rotationY: playerState.rotation.y,
        rotationZ: playerState.rotation.z,
      }));

    playerStates.set(playerId, initialPlayerState);

    console.log(`Client connected. IP: ${connectedClient.remoteAddress}, Port: ${connectedClient.remotePort}, OS: ${connectedClient.osType} ${connectedClient.osVersion}`);

    //@TODO: Move below to happen when the player enters the world.
    const localPlayer: PlayerPositionData = {
      id: playerId,
      x: initialPlayerState.position.x,
      y: initialPlayerState.position.y,
      z: initialPlayerState.position.z,
      rotationX: initialPlayerState.rotation.x,
      rotationY: initialPlayerState.rotation.y,
      rotationZ: initialPlayerState.rotation.z,
    };

    // Send information about the local player and other players to the client.
    const playerPositionsPacket = Wrapper.encode({
      type: 'PlayerPositions',
      payload: PlayerPositions.encode({
        localPlayer,
        otherPlayers,
      }).finish(),
    }).finish();
    ws.send(playerPositionsPacket);

    // Broadcast the new player to all other clients.
    const playerJoinedWrapper = Wrapper.encode({
      type: 'PlayerJoined',
      payload: PlayerJoined.encode({
        newPlayer: localPlayer,
      }).finish(),
    }).finish();
    wss.broadcastExceptSender(playerJoinedWrapper, ws);

    ws.on("message", (data) => {
      try {
        const wrapper = Wrapper.decode(data as Uint8Array);
        const { type, payload } = wrapper;
        if (!type) {
          return;
        }

        console.log(`C->GS: ${type}`);

        const handler = handlers[type];
        if (handler && typeof handler.handle === "function" && payload) {
          handler.handle(ws, payload, "client");
        } else {
          console.error(`No handler found for type: ${type}`);
        }
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      connectedClients.delete(connectedClient);
      const playerId = wsToPlayerId.get(ws);
      wsToPlayerId.delete(ws);
      if (playerId) {
        playerStates.delete(playerId);
        const playerLeftPacket = Wrapper.encode({
          type: 'PlayerDisconnected',
          payload: PlayerDisconnected.encode({
            id: playerId,
          }).finish(),
        }).finish();
        wss.broadcastExceptSender(playerLeftPacket, ws);
      }

    });
  });

  wss.broadcast = (msg) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  wss.broadcastExceptSender = (msg, sender) => {
    Array.from(wss.clients)
      .filter(client => client !== sender && client.readyState === WebSocket.OPEN)
      .forEach(client => client.send(msg));
  };

  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
};