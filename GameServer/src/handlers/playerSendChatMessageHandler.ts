import { AddChatMessage, PlayerSendChatMessage, Wrapper } from "@/messages/gameserver";
import { IHandler } from "./types";
import { connectedClients, playerStates, wss, wsToUserId } from "@/webSocketServer";

const PlayerSendChatMessageHandler: IHandler = {
  type: "PlayerSendChatMessage",
  handle: (ws, payload) => {
    const data = PlayerSendChatMessage.decode(payload);
    const userId = wsToUserId.get(ws);
    if (!userId) {
      return;
    }
    const playerState = playerStates.get(userId);
    if (!playerState) {
      return;
    }

    const message = Wrapper.encode({
      type: "AddChatMessage",
      payload: AddChatMessage.encode({
        username: playerState.username,
        message: data.message,
      }).finish(),
    }).finish();

    wss.broadcast(message);
  },
};

export default PlayerSendChatMessageHandler;