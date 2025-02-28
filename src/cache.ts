import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_FILE = path.join(__dirname, "album_cache.json");

function loadCache(): Record<string, string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("캐시 불러오기 실패:", error);
  }
  return {};
}

function saveCache(cache: Record<string, string>) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
  } catch (error) {
    console.error("캐시 저장 실패:", error);
  }
}

export function getCachedAlbumArt(album: string, artist: string): string | null {
  const cache = loadCache();
  const hash = crypto.createHash("md5").update(`${album}-${artist}`).digest("hex");
  return cache[hash] || null;
}

export function saveAlbumArtCache(album: string, artist: string, imgUrl: string) {
  const cache = loadCache();
  const hash = crypto.createHash("md5").update(`${album}-${artist}`).digest("hex");
  cache[hash] = imgUrl;
  saveCache(cache);
}
