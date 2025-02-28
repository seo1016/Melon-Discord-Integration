import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export async function fetchAlbumArt(song: string, artist: string): Promise<string> {
  try {
    console.log(`멜론에서 앨범 이미지 검색: ${song} - ${artist}`);

    const searchUrl = `https://www.melon.com/search/song/index.htm?q=${encodeURIComponent(song + " " + artist)}`;

    const response = await axios.get(searchUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Referer": "https://www.melon.com/",
      },
    });

    const decodedHtml = iconv.decode(Buffer.from(response.data), "EUC-KR");

    const $ = cheerio.load(decodedHtml);

    const songLink = $("a[href*='goSongDetail']").first().attr("href");
    const songId = songLink?.match(/goSongDetail\('(\d+)'\)/)?.[1];

    if (!songId) {
      console.warn(`멜론에서 곡 정보를 찾을 수 없음: ${song} - ${artist}`);
      return "melon-logo";
    }

    const songDetailUrl = `https://www.melon.com/song/detail.htm?songId=${songId}`;

    console.log(`곡 상세 페이지 이동: ${songDetailUrl}`);

    const songResponse = await axios.get(songDetailUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Referer": "https://www.melon.com/",
      },
    });

    const songPageHtml = iconv.decode(Buffer.from(songResponse.data), "EUC-KR");

    const songPage = cheerio.load(songPageHtml);

    const albumImg = songPage("meta[property='og:image']").attr("content");

    if (!albumImg) {
      console.warn(`앨범 이미지를 찾을 수 없음: ${song} - ${artist}`);
      return "melon-logo";
    }

    console.log(`앨범 이미지 가져오기 성공: ${albumImg}`);
    return albumImg;
  } catch (error) {
    console.error(`멜론 앨범 이미지 가져오기 실패: ${song} - ${artist}`, error);
    return "melon-logo";
  }
}
