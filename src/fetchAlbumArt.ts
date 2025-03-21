import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export async function fetchAlbumArt(song: string, artist: string): Promise<string> {
  try {
    const searchUrl = `https://www.melon.com/search/song/index.htm?q=${encodeURIComponent(song + " " + artist)}`;
    
    const response = await axios.get(searchUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.melon.com/" }
    });
    
    const decodedHtml = iconv.decode(Buffer.from(response.data), "EUC-KR");
    const $ = cheerio.load(decodedHtml);
    const songLink = $("a[href*='goSongDetail']").first().attr("href");
    const songId = songLink?.match(/goSongDetail\('(\d+)'\)/)?.[1];
    
    if (!songId) return "melon-logo";
    
    const songDetailUrl = `https://www.melon.com/song/detail.htm?songId=${songId}`;
    
    const songResponse = await axios.get(songDetailUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.melon.com/" }
    });
    
    const songPageHtml = iconv.decode(Buffer.from(songResponse.data), "EUC-KR");
    const songPage = cheerio.load(songPageHtml);
    const albumImg = songPage("meta[property='og:image']").attr("content");
    
    return albumImg || "melon-logo";
  } catch (error) {
    console.error(`멜론 앨범 이미지 가져오기 실패: ${song} - ${artist}`, error);
    return "melon-logo";
  }
}
