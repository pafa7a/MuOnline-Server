import { LoginRequest, LoginResponse, LoginResponseEnum, Wrapper } from "@/messages/gameserver";
import { IHandler } from "./types";
import { getConfig } from "@/helpers/configHelpers";
import { WebSocket } from "ws";

const RequestServerList: IHandler = {
  type: "LoginRequest",
  handle: (ws, payload) => {
    const data = LoginRequest.decode(payload);
    // Validate version.
    const version = getConfig('common', 'version');
    if (data.version !== version) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_INVALID_VERSION);
    }

    // Validate serial.
    const serial = getConfig('common', 'serial');
    if (data.serial !== serial) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_INVALID_SERIAL);
    }

    console.log(data)
  },
};

const loginResponse = (ws: WebSocket, responseCode: LoginResponseEnum) => {
  const response = Wrapper.encode({
    type: "LoginResponse",
    payload: LoginResponse.encode({
      responseCode
    }).finish()
  }).finish();
  return ws.send(response);
}

export default RequestServerList;