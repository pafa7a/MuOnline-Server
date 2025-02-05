import "reflect-metadata";
import { loadAllConfigs } from "@/helpers/configHelpers";
import { initWebSocketServer } from "@/webSocketServer";
import { initCli } from "@/cli";
import { connectToConnectServer } from "@/helpers/connectServerConnection";
import { initDatabase } from "@/helpers/databaseConnection";

const start = async () => {
    loadAllConfigs();
    await initDatabase();
    initWebSocketServer();
    connectToConnectServer();
    initCli();
};

start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});