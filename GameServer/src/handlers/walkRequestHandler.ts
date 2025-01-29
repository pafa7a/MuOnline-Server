import { MovePlayer, WalkRequest, Wrapper } from "@/messages/gameserver";
import { IHandler } from "./types";
import { playerStates, wss, wsToPlayerId } from "@/webSocketServer";

const WalkRequestHandler: IHandler = {
  type: "WalkRequest",
  handle: (ws, payload) => {
    const data = WalkRequest.decode(payload);
    const playerId = wsToPlayerId.get(ws);
    if (!playerId) {
      return;
    }
    const playerState = playerStates.get(playerId);
    if (!playerState) {
      return;
    }
    const newPlayerPosition = {
      x: data.x,
      y: data.y,
      z: data.z,
    };
    playerState.position = newPlayerPosition;

    const message = Wrapper.encode({
      type: "MovePlayer",
      payload: MovePlayer.encode({
        id: playerId,
        x: newPlayerPosition.x,
        y: newPlayerPosition.y,
        z: newPlayerPosition.z,
      }).finish(),
    }).finish();

    wss.broadcast(message);
  },
};

export default WalkRequestHandler;