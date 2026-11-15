// 화면 아래 잠깐 뜨는 알림 한 줄 — 창이 이미 닫힌 뒤에 알려야 할 때(./go-button.tsx away · 형 11-15 「만들기 이런걸 눌렀을때 그 창에서 기다릴게 아니라」)
//   리액트 밖(그냥 DOM) = 단추가 사라진 뒤에도 뜸 · 꼴 = ./go-button.css .nm-flash · 5초 뒤 사라짐 · 누르면 바로 사라짐
export function flash(text: string, kind: "bad" | "ok" = "bad", ms = kind === "ok" ? 3200 : 5000) {
  if (typeof document === "undefined") return;
  const el = document.createElement("div");
  el.className = kind === "ok" ? "nm-flash ok" : "nm-flash"; el.setAttribute("role", "alert"); el.textContent = text;
  const out = () => { el.classList.add("out"); setTimeout(() => el.remove(), 320); };
  el.addEventListener("click", out);
  document.body.appendChild(el);
  setTimeout(out, ms);
}
