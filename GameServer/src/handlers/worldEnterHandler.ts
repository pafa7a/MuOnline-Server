import { Wrapper, PlayerPositions, PlayerJoined, PlayerPositionData } from "@/messages/gameserver";
import { IHandler } from "./types";
import { WebSocket } from "ws";
import { playerStates, wsToUserId, wss, connectedClients } from "@/webSocketServer";

const WorldEnterHandler: IHandler = {
  type: "WorldEnter",
  handle: async (ws: WebSocket) => {
    const userId = wsToUserId.get(ws);
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const initialPlayerState = {
      id: userId,
      position: { x: 133, y: 0, z: 124 },
      rotation: { x: 0, y: 0, z: 0 },
      isInWorld: true,
      connectedClient: Array.from(connectedClients)
        .find(client => client.ws === ws)!
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

    playerStates.set(userId, initialPlayerState);

    const localPlayer: PlayerPositionData = {
      id: userId.toString(),
      x: initialPlayerState.position.x,
      y: initialPlayerState.position.y,
      z: initialPlayerState.position.z,
      rotationX: initialPlayerState.rotation.x,
      rotationY: initialPlayerState.rotation.y,
      rotationZ: initialPlayerState.rotation.z,
    };

    const playerPositionsPacket = Wrapper.encode({
      type: 'PlayerPositions',
      payload: PlayerPositions.encode({
        localPlayer,
        otherPlayers,
      }).finish(),
    }).finish();
    ws.send(playerPositionsPacket);

    const playerJoinedWrapper = Wrapper.encode({
      type: 'PlayerJoined',
      payload: PlayerJoined.encode({
        newPlayer: localPlayer,
      }).finish(),
    }).finish();
    wss.broadcastExceptSender(playerJoinedWrapper, ws);
  }
};

export default WorldEnterHandler;
