import { MovePlayer, WalkRequest, Wrapper } from "@/messages/gameserver";
import { IHandler } from "./types";
import { playerStates, wss, wsToUserId } from "@/webSocketServer";

const WalkRequestHandler: IHandler = {
  type: "WalkRequest",
  handle: (ws, payload) => {
    const data = WalkRequest.decode(payload);
    const userId = wsToUserId.get(ws);
    if (!userId) {
      return;
    }
    const playerState = playerStates.get(userId);
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
        id: userId.toString(),
        x: newPlayerPosition.x,
        y: newPlayerPosition.y,
        z: newPlayerPosition.z,
      }).finish(),
    }).finish();

    wss.broadcast(message);
  },
};

export default WalkRequestHandler;