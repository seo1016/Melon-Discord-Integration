import { Client } from "@xhayper/discord-rpc";
import "dotenv/config";
import { setReady } from "./ready";
import { ActivityData } from "./request";

class RPCHandler {
  private static client: Client;
  private static updateInterval: NodeJS.Timeout | null = null;
  private static currentActivityData: ActivityData | null = null;

  public static async connect(): Promise<void> {
    RPCHandler.client = new Client({
      clientId: process.env.CLIENT_ID || ""
    });

    RPCHandler.client.once("ready", () => {
      console.log("✅ Discord RPC 연결 성공");
      setReady(true);
      if (RPCHandler.currentActivityData) {
        RPCHandler.startAutoUpdate(RPCHandler.currentActivityData);
      }
    });

    try {
      await RPCHandler.client.login();
    } catch (err) {
      console.error("❌ Discord RPC 로그인 에러:", err);
      RPCHandler.client.destroy();
    }
  }

  public static async setActivity(data: ActivityData): Promise<void> {
    if (!RPCHandler.client?.user) return;

    RPCHandler.currentActivityData = data;

    await RPCHandler.client.user.setActivity({
      details: `🎵 ${data.title}`,
      state: `👤 ${data.artist}`,
      largeImageKey: data.albumArt || "melon-logo"
    });

    console.log(`🎶 Rich Presence 업데이트 완료: ${data.title} - ${data.artist}`);

    if (!RPCHandler.updateInterval) {
      RPCHandler.startAutoUpdate(data);
    }
  }

  private static startAutoUpdate(data: ActivityData): void {
    if (RPCHandler.updateInterval) {
      clearInterval(RPCHandler.updateInterval);
    }
    RPCHandler.updateInterval = setInterval(async () => {
      await RPCHandler.client?.user?.setActivity({
        type: 2,
        details: `🎵 ${data.title}`,
        state: `👤 ${data.artist}`,
        largeImageKey: data.albumArt || "melon-logo"
      });
      console.log("🔄 Rich Presence 갱신 중...");
    }, 15000);
  }

  public static async clearActivity(): Promise<void> {
    if (RPCHandler.client?.user) {
      await RPCHandler.client.user.clearActivity();
      console.log("🗑️ Rich Presence 초기화됨.");
    }
    if (RPCHandler.updateInterval) {
      clearInterval(RPCHandler.updateInterval);
      RPCHandler.updateInterval = null;
    }
    RPCHandler.currentActivityData = null;
  }

  public static async destroy(): Promise<void> {
    await RPCHandler.clearActivity();
    await RPCHandler.client?.destroy();
  }

  public static getClient(): Client | null {
    return RPCHandler.client || null;
  }
}

export default RPCHandler;
