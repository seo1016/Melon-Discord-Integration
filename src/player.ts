import { windowManager } from "node-window-manager";
import RPCHandler from "./rpc";
import { ActivityData } from "./request";
import { default as psList } from "ps-list";

let currentWindowTitle = "";

export async function pollMelonPlayer(): Promise<void> {
  try {
    const processes = await psList();
    const melonProcess = processes.find((p) => p.name.toLowerCase().includes("melon"));

    if (!melonProcess) {
      console.log("Melon 프로세스 없음. 상태 초기화.");
      await RPCHandler.clearActivity();
      return;
    }

    const windows = windowManager.getWindows();

    const melonWindow = windows.find((w) => {
      const title = w.getTitle();
      if (!title || !title.includes(" - ")) return false;

      return processes.some((p) => p.pid === w.processId && p.name.toLowerCase().includes("melon"));
    });

    console.log("Melon window found:", melonWindow ? melonWindow.getTitle() : "None");

    if (!melonWindow) {
      console.log("Melon 창 없음. 기존 상태 유지.");
      return;
    }

    const titleStr = melonWindow.getTitle();
    console.log("Melon window title:", titleStr);

    if (currentWindowTitle === titleStr) return;
    currentWindowTitle = titleStr;

    const [songTitleRaw, artistRaw] = titleStr.split(" - ");
    if (!songTitleRaw || !artistRaw) {
      console.log("창 제목 형식이 올바르지 않음. 상태 유지.");
      return;
    }
    const songTitle = songTitleRaw.trim();
    const artist = artistRaw.trim();

    const data: ActivityData = {
      title: songTitle,
      artist: artist,
      albumArt: "melon-logo",
    };

    console.log("상태 업데이트 데이터:", data);

    await RPCHandler.clearActivity();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await RPCHandler.setActivity(data);

  } catch (err) {
    console.error("pollMelonPlayer 에러:", err);
  }
}
