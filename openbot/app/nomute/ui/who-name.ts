// 화면에 찍는 이름 = 화자 id 끝 「 PM」 뺌(형 「pm 이런것도 좀 없애. 딱 오늘까지 였어」 · 서버 글 줄은 editor#2341 에서 「윈터」 · who 칸은 열쇠·부름 때문에 「윈터 PM」 그대로)
//   사람표(people)가 있는 자리는 name 을 먼저 씀 · 이건 name 이 없는 자리(고정 띠 · 오늘 · 설정 표 · 시스템 줄)의 마지막 모양
export const whoName = (who?: string | null) => String(who ?? "").replace(/ PM$/, "");
