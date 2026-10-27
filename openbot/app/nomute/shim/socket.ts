// 원본의 채널 소켓(/api/channels/events) 자리 — 우리 서버엔 소켓이 없어서, pulse(data/sync.ts)가 방 목록 바뀜을 알리면 「resync」 한 줄
//   그 밖의 소켓(음성·컴퓨터 화면) = 우리 기능 없음 → 바로 닫힘
import { bus } from "../data/sync";

const RealWS = window.WebSocket;

class OfficeEvents extends EventTarget {
  readonly url: string;
  readyState = 0;
  binaryType: BinaryType = "blob";
  bufferedAmount = 0;
  extensions = "";
  protocol = "";
  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: ((e: CloseEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
  CONNECTING = 0; OPEN = 1; CLOSING = 2; CLOSED = 3;
  private onRooms = () => this.fire("message", new MessageEvent("message", { data: JSON.stringify({ resync: true }) }));

  constructor(url: string, listen: boolean) {
    super();
    this.url = url;
    if (listen) bus.addEventListener("rooms", this.onRooms);
    setTimeout(() => { if (this.readyState === 0) { this.readyState = 1; this.fire("open", new Event("open")); } }, 0);
  }
  private fire(type: string, e: Event) {
    const h = (this as unknown as Record<string, ((e: Event) => void) | null>)[`on${type}`];
    if (h) h.call(this, e);
    this.dispatchEvent(e);
  }
  send() {}
  close() {
    if (this.readyState >= 2) return;
    this.readyState = 3;
    bus.removeEventListener("rooms", this.onRooms);
    this.fire("close", new CloseEvent("close", { code: 1000, wasClean: true }));
  }
}

window.WebSocket = new Proxy(RealWS, {
  construct(target, args: [string | URL, (string | string[])?]) {
    const url = new URL(String(args[0]), location.href);
    if (url.host === location.host && url.pathname === "/api/channels/events") return new OfficeEvents(url.href, true) as unknown as WebSocket;
    if (url.host === location.host && url.pathname.startsWith("/api/")) {
      const s = new OfficeEvents(url.href, false);
      setTimeout(() => s.close(), 0);
      return s as unknown as WebSocket;
    }
    return new target(...(args as [string, string[]]));
  },
}) as typeof WebSocket;
