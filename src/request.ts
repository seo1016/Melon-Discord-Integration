let ready = false;

export function setReady(value: boolean): void {
  ready = value;
}

export function getReady(): boolean {
  return ready;
}

export interface ActivityData {
  title: string;
  artist: string;
  albumArt: string;
}
