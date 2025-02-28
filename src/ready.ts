let ready = false;

export function setReady(value: boolean): void {
  ready = value;
}

export function getReady(): boolean {
  return ready;
}
