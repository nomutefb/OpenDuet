// 뉴스 제목 다듬기 = 로직(형 11-05 16:14 「그리고 항상 뉴스에는 다듬어져서 나오게 해줘 타이틀이」 · 「로직이야 이거는 누가 수정하는게 아니라 로직을 구성」)
//   걷는 것 = 머리 꼬리표(【포토】·<영상>·(종합)) · 갤 머리표([싱갤]) · 끝 꼬리표((2보)) · 끝 매체 이름(「- 매일경제」 · 「| 연합뉴스」) · .JPG 꼬리 · ㅋㅋ·ㄷㄷ·^^ 끝 · 앞머리 기호(▶■◆★) · 이모지 · …/... 잘림 · 겹 공백
//   안 건드리는 것 = [단독]·[속보]·[긴급](뜻이 있음 · 뜸 서버 cleanTitle 과 같은 뜻) · 원문 기사 주소 · 서버가 다듬은 칸(title_clean · 뜸)이 오면 그걸 먼저 씀 = 여기는 그 칸이 없을 때만 받침
const TAG = "(?:종합|포토|사진|영상|화보|르포|인터뷰|사설|칼럼|기고|오피니언|시론|기자수첩|이슈|현장|뉴스\\s?\\S{0,4}|\\d보|상보|일문일답|팩트체크|SC|MD|E|K|TV|HD|4K|광고|AD|PR)";
const HEAD = new RegExp(`^(?:\\s*[\\[【〈<《(（「『]\\s*${TAG}[^\\]】〉>》)）」』]{0,6}[\\]】〉>》)）」』]\\s*)+`, "u");
const TAIL_TAG = new RegExp(`\\s*[\\[(（【]\\s*${TAG}[^\\])）】]{0,6}[\\])）】]\\s*$`, "u");
const OUTLET = /\s*[-|｜–—·]\s*(?:[가-힣A-Za-z0-9.& ]{1,14}?(?:일보|신문|뉴스|경제|방송|미디어|타임스|타임즈|헤럴드|투데이|데일리|저널|포스트|닷컴|매거진|tv|TV|신보|통신|news|News|NEWS)|[a-z0-9-]+\.(?:com|co\.kr|kr|net|news))\s*$/u;
const LEAD_SYM = /^[\s▶▷►■□◆◇★☆●○◎※→⇒>»·•\-–—]+/u;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const GALL = /^(?:\s*\[[가-힣A-Za-z]{1,4}갤\]\s*)+/u;   // 커뮤 갤 머리표([싱갤] · [미갤] · 뜸과 같음)
const FILE_TAIL = /\s*\.?(?:jpg|jpeg|gif|png|webp|mp4)\s*$/iu;   // .JPG · GIF 꼬리
const LAUGH_TAIL = /\s*(?:[ㅋㅎㄷㅠㅜ]{2,}|\^\^|;;+)\s*$/u;   // ㅋㅋ · ㄷㄷ · ㅠㅠ · ^^ 끝

export function cleanTitle(raw: string | undefined | null): string {
  let s = String(raw || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  const before = s;
  for (let i = 0; i < 3; i++) {   // 꼬리표가 둘셋 겹친 것([단독][종합] … - 연합뉴스)
    const prev = s;
    s = s.replace(EMOJI, "").replace(LEAD_SYM, "").replace(GALL, "").replace(HEAD, "").replace(TAIL_TAG, "").replace(OUTLET, "").replace(FILE_TAIL, "").replace(LAUGH_TAIL, "").trim();
    if (s === prev) break;
  }
  s = s.replace(/\s*(?:…|\.{3,})\s*$/u, "").replace(/\s{2,}/g, " ").trim();
  return s.length >= 4 ? s : before;   // 다 걷혀서 너무 짧아지면 원래 제목
}
