// 설정 「알림」 줄 — 형 폰 알림 켜기·끄기(앱이 꺼져 있어도 · 형 10-28 16:32 「웹앱으로 일단 해」 · 장부 claude-state assign/2026-10-28/office-webpush-share.md)
//   끼우는 자리 = 설정 판(ui/yeta-settings.tsx · 보조 02) 「화면」 칸 아래 <PushRow /> 한 줄 · 꼴 = YETA 설정 줄 그대로(.yset-item · .si-sw 켜짐/꺼짐)
//   켜기 = 에디터 알림 켜기와 같은 차례(권한 → 구독 → /api/push 저장 · app office = 사무실 알림만 옴) · 끄기 = 서버에서 빼고 구독 풂
//   /api/push = 원본 앱 흉내(shim · window.fetch 만 가로챔)를 안 거치게 XHR 로 서버 그대로 · 권한 막힘 = 폰 설정에서만 풀림(누를 곳 한 줄)
import { useEffect, useState } from "react";
import { YICO } from "../ui/yeta-icons";

const VAPID_PUB = "BORNTh3cNd05vsxi2fZ-BykxM0NwKGTvIETz81g757RVFL6cDu29aAv5I7uit0WbGOmiZ4hlyMOEvb8B2HptU-I";   // 정본 = editor viewer-src/28-flagShellUpdate.part · sw.js 와 같은 값
type St = "on" | "off" | "busy" | "blocked" | "none";

const keyBytes = () => { const pad = "=".repeat((4 - (VAPID_PUB.length % 4)) % 4); return Uint8Array.from(atob((VAPID_PUB + pad).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)); };
const post = (body: unknown) => new Promise<number>((done) => {
  const x = new XMLHttpRequest();
  x.open("POST", "/api/push");
  x.setRequestHeader("content-type", "application/json");
  x.onload = () => done(x.status); x.onerror = () => done(0);
  x.send(JSON.stringify(body));
});
const reg = () => navigator.serviceWorker.getRegistration("/office-app/");

export function PushRow() {
  const [st, setSt] = useState<St>("busy"), [err, setErr] = useState("");
  const read = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setSt("none");
    if (Notification.permission === "denied") return setSt("blocked");
    setSt((await (await reg())?.pushManager.getSubscription()) ? "on" : "off");
  };
  useEffect(() => { void read().catch(() => setSt("none")); }, []);
  const flip = async () => {
    if (st === "busy" || st === "none") return;
    setErr(""); setSt("busy");
    try {
      const r = await reg();
      if (!r) throw new Error("앱 일꾼(서비스 워커)이 아직 안 섰어 — 새로 고친 뒤 다시");
      const cur = await r.pushManager.getSubscription();
      if (cur) {
        await post({ action: "unsubscribe", subscription: cur.toJSON() });
        await cur.unsubscribe();
      } else {
        if ((await Notification.requestPermission()) !== "granted") return void (await read());
        const sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes() });
        const code = await post({ action: "subscribe", subscription: sub.toJSON(), app: "office" });
        if (code !== 200) { await sub.unsubscribe().catch(() => {}); throw new Error(`서버에 못 적음(${code || "네트워크·로그인 끝남"})`); }
      }
      await read();
    } catch (e) {
      setErr(String((e as Error)?.message || e).slice(0, 80));
      await read().catch(() => setSt("none"));
    }
  };
  const d = st === "on" ? "켜짐 · 1:1 새 글·「!형」·⏳ = 앱이 꺼져 있어도 옴" : st === "blocked" ? "막힘 — 앱 아이콘 꾹 → 앱 정보 → 알림 → 허용"
    : st === "none" ? "이 브라우저는 알림을 못 받아" : st === "busy" ? "바꾸는 중…" : "꺼짐 · 누르면 켬";
  return (
    <button type="button" className={`yset-item${st === "on" ? " on" : ""}`} onClick={() => void flip()} aria-pressed={st === "on"} aria-busy={st === "busy" || undefined}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.bell }} />
      <span className="si-lbl"><span className="si-t">알림</span><span className="si-d" role={err ? "alert" : undefined}>{err || d}</span></span>
      <span className="si-sw" aria-hidden />
    </button>
  );
}
