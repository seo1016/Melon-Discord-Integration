import activeWin from "active-win";
import RPCHandler from "./rpc";
import { ActivityData } from "./request";

let currentWindowTitle = "";

export async function pollMelonPlayer(): Promise<void> {
  try {
    const winInfo = await activeWin();
    console.log("Active window info:", winInfo);
    const { default: psList } = await import("ps-list");

    if (!winInfo) {
      const processes = await psList();
      const melonProcess = processes.find(p => p.name.toLowerCase().includes("melon"));
      if (melonProcess) {
        console.log("Melon 프로세스는 실행 중이나, 활성 창이 없음. 기존 상태 유지.");
        return;
      } else {
        console.log("Melon 프로세스 없음. 상태 초기화.");
        await RPCHandler.clearActivity();
        return;
      }
    }

    const ownerName = (winInfo.owner?.name || "").toLowerCase();
    console.log("Owner name:", ownerName);
    if (!ownerName.includes("멜론") && !ownerName.includes("melon")) {
      const processes = await psList();
      const melonProcess = processes.find(p => p.name.toLowerCase().includes("melon"));
      if (melonProcess) {
        console.log("활성 창은 Melon이 아니지만, Melon 프로세스는 실행 중임. 상태 유지.");
        return;
      } else {
        console.log("Melon 프로세스 없음. 상태 초기화.");
        await RPCHandler.clearActivity();
        return;
      }
    }

    const titleStr = winInfo.title || "";
    console.log("Window title:", titleStr);
    if (!titleStr.includes(" - ")) {
      const processes = await psList();
      const melonProcess = processes.find(p => p.name.toLowerCase().includes("melon"));
      if (melonProcess) {
        console.log("창 제목 형식이 올바르지 않지만, Melon 프로세스는 실행 중임. 상태 유지.");
        return;
      } else {
        console.log("Melon 프로세스 없음. 상태 초기화.");
        await RPCHandler.clearActivity();
        return;
      }
    }

    if (currentWindowTitle === titleStr) return;
    currentWindowTitle = titleStr;

    const [songTitleRaw, artistRaw] = titleStr.split(" - ");
    const songTitle = songTitleRaw.trim();
    const artist = artistRaw.trim();

    const data: ActivityData = {
      title: songTitle,
      artist: artist,
      albumArt: "melon-logo"
    };

    console.log("상태 업데이트 데이터:", data);
    await RPCHandler.setActivity(data);
  } catch (err) {
    console.error("pollMelonPlayer 에러:", err);
  }
}
