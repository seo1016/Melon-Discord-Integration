import { app } from "electron";
import dotenv from "dotenv";
import RPCHandler from "./rpc";
import { pollMelonPlayer } from "./player";

dotenv.config();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else app.on("ready", async () => {
  await RPCHandler.connect();
  setInterval(pollMelonPlayer, 2000);
});
