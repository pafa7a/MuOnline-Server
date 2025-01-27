import path from "path";
import fs from "fs";
import { IHandler } from "@/handlers/types";

export const getAllHandlers = () => {
  const handlersDir = path.join(__dirname, "../handlers");

  const handlers: { [key: string]: IHandler } = {};

  fs.readdirSync(handlersDir).forEach((file) => {
    const handler: IHandler = require(path.join(handlersDir, file)).default;
    if (handler?.type) {
      handlers[handler.type] = handler;
    }
  });
  return handlers;
};