import { app, BrowserWindow } from "electron";
import dotenv from "dotenv";
import RPCHandler from "./rpc";
import { pollMelonPlayer } from "./player";
import { autoUpdater } from "electron-updater";

dotenv.config();

let mainWindow: BrowserWindow | null = null;
const gotLock = app.requestSingleInstanceLock();

const enableAutoStartup = process.env.AUTO_START === "true";
if (enableAutoStartup) {
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath("exe"),
    args: []
  });
  console.log("자동 실행이 활성화되었습니다.");
}

if (!gotLock) {
  app.quit();
} else {
  app.on("ready", async () => {
    mainWindow = new BrowserWindow({
      width: 300,
      height: 200,
      show: false,
      webPreferences: { nodeIntegration: true }
    });
    
    await RPCHandler.connect();
    setInterval(pollMelonPlayer, 2000);

    autoUpdater.checkForUpdatesAndNotify();
  });
  
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}

autoUpdater.on("update-available", () => {
  console.log("새로운 업데이트가 감지되었습니다. 다운로드 중...");
});

autoUpdater.on("update-downloaded", () => {
  console.log("업데이트 다운로드 완료. 앱을 재시작합니다.");
  autoUpdater.quitAndInstall();
});

autoUpdater.on("error", (err) => {
  console.error("업데이트 중 에러 발생:", err);
});
