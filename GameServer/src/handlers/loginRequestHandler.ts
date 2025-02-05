import { LoginRequest, LoginResponse, LoginResponseEnum, Wrapper } from "@/messages/gameserver";
import { IHandler } from "./types";
import { getConfig } from "@/helpers/configHelpers";
import { WebSocket } from "ws";
import { AppDataSource } from "@/helpers/databaseConnection";
import { User } from "@/database/entities/User";
import { createHash } from "crypto";
import { connectedClients } from "@/webSocketServer";

const hashPassword = (password: string): string => {
  return createHash('sha512').update(password).digest('hex');
};

const validateCredentials = async (username: string, password: string): Promise<User | null> => {
  const userRepository = AppDataSource.getRepository(User);
  const hashedPassword = hashPassword(password);
  return userRepository.findOne({
    where: {
      username: username,
      password: hashedPassword
    }
  });
};

const isBanned = (user: User): boolean => {
  return user.block_code === 1;
};

const validateInputLengths = (username: string, password: string): boolean => {
  return username.length >= 4 &&
    username.length <= 10 &&
    password.length >= 4 &&
    password.length <= 16;
};

const MAX_ATTEMPTS = 3;

const checkLoginAttempts = (ws: WebSocket): boolean => {
  const client = Array.from(connectedClients).find(c => c.ws === ws);
  if (!client) return false;

  if (client.loginAttempts >= MAX_ATTEMPTS) {
    return false;
  }

  client.loginAttempts++;
  return true;
};

const RequestServerList: IHandler = {
  type: "LoginRequest",
  handle: async (ws, payload) => {
    if (!checkLoginAttempts(ws)) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_TOO_MANY_ATTEMPTS);
    }

    const { username, password, version, serial } = LoginRequest.decode(payload);

    // Validate version
    const configVersion = getConfig('common', 'version');
    if (version !== configVersion) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_INVALID_VERSION);
    }

    // Validate serial
    const configSerial = getConfig('common', 'serial');
    if (serial !== configSerial) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_INVALID_SERIAL);
    }

    // Validate input lengths
    if (!validateInputLengths(username, password)) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_INVALID_CREDENTIALS);
    }

    // Validate credentials
    const user = await validateCredentials(username, password);
    if (!user) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_INVALID_CREDENTIALS);
    }

    // Reset attempts on successful login
    const client = Array.from(connectedClients).find(c => c.ws === ws);
    if (client) {
      client.loginAttempts = 0;
    }

    // Check if user is banned
    if (isBanned(user)) {
      return loginResponse(ws, LoginResponseEnum.LOGIN_BANNED);
    }

    return loginResponse(ws, LoginResponseEnum.LOGIN_OK);
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