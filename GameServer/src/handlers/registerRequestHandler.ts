import { RegisterRequest, RegisterResponse, RegisterResponseEnum, Wrapper } from "@/messages/gameserver";
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

const validateInputLengths = (username: string, password: string, email: string): boolean => {
  return username.length >= 4 &&
    username.length <= 10 &&
    password.length >= 4 &&
    password.length <= 16 &&
    email.length >= 5 &&
    email.length <= 50;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const checkExistingUser = async (username: string, email: string): Promise<boolean> => {
  const userRepository = AppDataSource.getRepository(User);
  const existingUser = await userRepository.findOne({
    where: [
      { username: username },
      { email: email }
    ]
  });
  return !!existingUser;
};

const checkRegisterAttempts = (ws: WebSocket): boolean => {
  const client = Array.from(connectedClients).find(c => c.ws === ws);
  if (!client) return false;

  const maxAttempts = getConfig('common', 'maxAttempts');
  if (client.failedAttempts >= maxAttempts) {
    return false;
  }

  client.failedAttempts++;
  return true;
};

const RegisterHandler: IHandler = {
  type: "RegisterRequest",
  handle: async (ws, payload) => {
    if (!checkRegisterAttempts(ws)) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_TOO_MANY_ATTEMPTS);
    }

    const { username, email, password, version, serial } = RegisterRequest.decode(payload);

    // Validate version
    const configVersion = getConfig('common', 'version');
    if (version !== configVersion) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_INVALID_VERSION);
    }

    // Validate serial
    const configSerial = getConfig('common', 'serial');
    if (serial !== configSerial) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_INVALID_SERIAL);
    }

    // Validate input lengths
    if (!validateInputLengths(username, password, email)) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_INVALID_INPUT);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_INVALID_EMAIL);
    }

    // Check existing user
    if (await checkExistingUser(username, email)) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_USER_EXISTS);
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = new User();
      user.username = username;
      user.email = email;
      user.password = hashPassword(password);
      await userRepository.save(user);

      // Reset attempts on successful registration
      const client = Array.from(connectedClients).find(c => c.ws === ws);
      if (client) {
        client.failedAttempts = 0;
      }

      return registerResponse(ws, RegisterResponseEnum.REGISTER_OK);
    } catch (error) {
      return registerResponse(ws, RegisterResponseEnum.REGISTER_ERROR);
    }
  },
};

const registerResponse = (ws: WebSocket, responseCode: RegisterResponseEnum) => {
  const response = Wrapper.encode({
    type: "RegisterResponse",
    payload: RegisterResponse.encode({
      responseCode
    }).finish()
  }).finish();
  return ws.send(response);
}

export default RegisterHandler;
