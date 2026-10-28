// 품은 에디터 화면 겉 = YETA 톤(형 10-28 15:33 「그대로 가져와서 여기 톤에 녹인다고 생각하면 될듯.」) — 에디터 원본 화면·기능·자료는 그대로, 겉 값만 이 앱 값으로
//   값 = 이 앱 YETA 토큰(ui/yeta-chat.css .nm-yeta : 바탕 #161716 · 글 #FFF · 흐림 #8B8F8A · 선 .08 · 강조 #CFFF40) → 에디터 :root 토큰(viewer/index.html :root · modern-tokens.css 거울)에 덮음
//   물결 장면(#wavebg · nm-scene)·에디터 자기 아래 메뉴(#menu-host · #bnav) = 숨김(네비는 앱 것 하나 · 형 「네비게이션은 유지」) · 에디터는 어두운 판뿐 → 앱이 밝게면 바탕만 YETA 어두운 판으로 깖
const TOKENS = [
  "--space-bg:#161716", "--space-hi-rgb:22,23,22", "--bias-l1:#CFFF40", "--bias-l2:#8B8F8A",
  "--bg:#161716", "--fg:#FFFFFF", "--mut:#8B8F8A", "--line:rgba(255,255,255,.08)",
  "--accent:#CFFF40", "--accent-rgb:207,255,64", "--on-accent:#161716",
  "--modern-space-bg:#161716", "--modern-page:#161716", "--modern-space-hi-rgb:22,23,22",
  "--modern-bias-l1:#CFFF40", "--modern-bias-l2:#8B8F8A", "--modern-accent:#CFFF40", "--modern-accent-rgb:207,255,64", "--modern-on-accent:#161716",
  "--modern-fg:#FFFFFF", "--modern-ink:#FFFFFF", "--modern-mut:#8B8F8A", "--modern-muted:#8B8F8A",
  "--modern-line:rgba(255,255,255,.08)", "--modern-scrim:rgba(22,23,22,.86)",
];

/** 에디터 화면(겉 문서·안 도구 문서 모두)에 입힐 톤 CSS · dark = 앱이 어둡게(바탕 비움 = 앱 바탕이 비침) */
export function editorTone(dark: boolean): string {
  return `:root:root{${TOKENS.map((t) => t + "!important").join(";")}}
html,body{background:${dark ? "transparent" : "#161716"}!important}
body::before,#wavebg,.nm-scene-canvas{display:none!important}
#menu-host,#bnav{display:none!important}
#tooldlg #toolTitle{display:none!important}
#tooldlg>.tool-h:has(#toolMenuLb:empty):has(#toolRf[hidden]){display:none!important}`;   // 도구 창 제목 = 겹 머리 「< 이름」과 두 번(PM 15:02 모달 머리 하나만) · 도구 머리의 메뉴 전환(카드 제작 ▾)·새로고침은 그대로 · 둘 다 없는 도구(요약 요청) = 빈 띠째 걷음
}
