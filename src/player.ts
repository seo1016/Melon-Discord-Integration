import { windowManager } from "node-window-manager";
import RPCHandler from "./rpc";
import { ActivityData } from "./request";
import psList from "ps-list";

let currentWindowTitle = "";
let lastProcessId: number | null = null;

export async function pollMelonPlayer(): Promise<void> {
  try {
    const processes = await psList();
    const melonProcess = processes.find((p) =>
      p.name.toLowerCase().includes("melon") &&
      p.name.toLowerCase().includes("player")
    );

    if (!melonProcess) {
      await RPCHandler.clearActivity();
      currentWindowTitle = "";
      lastProcessId = null;
      return;
    }

    if (lastProcessId !== melonProcess.pid) {
      lastProcessId = melonProcess.pid;
      currentWindowTitle = "";
    }

    const windows = windowManager.getWindows();
    const melonWindow = windows.find((w) => {
      const title = w.getTitle();
      return title && processes.some((p) => p.pid === w.processId && p.name.toLowerCase().includes("melon"));
    });

    if (!melonWindow) {
      await RPCHandler.clearActivity();
      return;
    }

    const titleStr = melonWindow.getTitle();

    if (titleStr === "멜론 PC 플레이어") {
      const defaultData: ActivityData = {
        title: "노래 고르는 중...",
        artist: "찾는 중...",
        albumArt: "melon-logo"
      };
      await RPCHandler.setActivity(defaultData);
      return;
    }

    if (currentWindowTitle === titleStr) return;

    currentWindowTitle = titleStr;
    
    const [songTitleRaw, artistRaw] = titleStr.split(" - ");

    if (!songTitleRaw || !artistRaw) return;

    const songTitle = songTitleRaw.trim();
    const artist = artistRaw.trim();

    const data: ActivityData = {
      title: songTitle,
      artist: artist,
      albumArt: "melon-logo"
    };

    await RPCHandler.setActivity(data);
  } catch (err) {
    console.error("pollMelonPlayer 에러:", err);
  }
}
