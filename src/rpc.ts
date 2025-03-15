import { Client } from "@xhayper/discord-rpc";
import "dotenv/config";
import { setReady } from "./ready";
import { ActivityData } from "./request";
import { fetchAlbumArt } from "./fetchAlbumArt";
import { uploadToImgur } from "./uploadToImgur";

class RPCHandler {
  private static client: Client;
  private static currentActivityData: ActivityData | null = null;

  public static async connect(): Promise<void> {
    RPCHandler.client = new Client({ clientId: process.env.CLIENT_ID || "" });
    
    RPCHandler.client.once("ready", () => {
      console.log("Discord RPC 연결 성공");
      setReady(true);
    });
    
    try {
      await RPCHandler.client.login();
    } catch (err) {
      console.error("Discord RPC 로그인 에러:", err);
      RPCHandler.client.destroy();
    }
  }

  public static async setActivity(data: ActivityData): Promise<void> {
    if (!RPCHandler.client?.user) return;
    
    if (
      RPCHandler.currentActivityData &&
      RPCHandler.currentActivityData.title === data.title &&
      RPCHandler.currentActivityData.artist === data.artist
    ) {
      return;
    }
    
    let albumArt = await fetchAlbumArt(data.title, data.artist) ?? "melon-logo";
    
    if (albumArt !== "melon-logo") {
      albumArt = await uploadToImgur(data.title, data.artist, albumArt) ?? "melon-logo";
    }
    
    RPCHandler.currentActivityData = data;
    
    await RPCHandler.client.user.setActivity({
      type: 2,
      details: `🎧 ${data.title}`,
      state: `🎤 ${data.artist}`,
      largeImageKey: albumArt
    });
    
    console.log(`Rich Presence 업데이트 완료: ${data.title} - ${data.artist}`);
  }

  public static async clearActivity(): Promise<void> {
    if (RPCHandler.client?.user) {
      await RPCHandler.client.user.clearActivity();
      console.log("Rich Presence 초기화됨.");
    }
    RPCHandler.currentActivityData = null;
  }
}

export default RPCHandler;
