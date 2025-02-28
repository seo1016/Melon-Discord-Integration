import axios from "axios";

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID || "";

export async function uploadToImgur(song: string, artist: string, imageUrl: string): Promise<string> {
  try {
    if (!imageUrl.startsWith("http") || imageUrl.includes("melon-logo")) {
      console.warn(`유효하지 않은 이미지 URL: ${imageUrl}`);
      return "melon-logo";
    }

    console.log(`Imgur에 앨범 이미지 업로드 시도: ${imageUrl}`);

    const response = await axios.post(
      "https://api.imgur.com/3/image",
      { image: imageUrl },
      {
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Imgur 업로드 성공: ${response.data.data.link}`);
    return response.data.data.link;
  } catch (error) {
    console.error(`Imgur 업로드 실패: ${song} - ${artist}`, error);
    return "melon-logo";
  }
}
