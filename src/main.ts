import { app } from "electron";
import dotenv from "dotenv";
import RPCHandler from "./rpc";
import { pollMelonPlayer } from "./player";

dotenv.config();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("ready", async () => {
    console.log("앱 시작: Discord RPC 연결 시도");
    await RPCHandler.connect();

    setInterval(() => {
      pollMelonPlayer();
    }, 5000);
  });
}
