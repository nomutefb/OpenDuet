// 탭 픽토그램(PC 위 탭 줄 ./tab-bar.tsx · 폰 「사무실 | 팀즈 | 회의」 ./teams.tsx TeamsSwitch 같이 · 시아 11-13 · 원래 자리 = tab-bar.tsx)
/** 화상회의 픽토그램(카메라 + 사람 하나 · 라임) — 팀즈 「회의」처럼 한눈에 갈리는 제 아이콘(형 11-13 09:21) */
export const MeetIcon = () => (
  <svg className="nm-tab-ic meet" viewBox="0 0 24 24" aria-hidden>
    <rect x="1.5" y="5.5" width="14.5" height="13" rx="3" fill="#CFFF40" /><path d="M17.4 10.4l4.2-2.6c.4-.2.9.1.9.5v7.4c0 .4-.5.7-.9.5l-4.2-2.6z" fill="#CFFF40" />
    <circle cx="8.75" cy="10.4" r="2.3" fill="#121314" /><path d="M4.6 16.4c.5-2 2.2-3.1 4.15-3.1s3.65 1.1 4.15 3.1z" fill="#121314" />
  </svg>
);
/** 팀즈 픽토그램(사람 둘 + T 판 · 보라) */
export const TeamsIcon = () => (
  <svg className="nm-tab-ic teams" viewBox="0 0 24 24" aria-hidden>
    <circle cx="18.2" cy="6.6" r="2.4" fill="#7B83EB" /><path d="M15.4 10.2h5.4c.7 0 1.2.5 1.2 1.2v4.3a3.2 3.2 0 0 1-6.4 0v-5.5z" fill="#7B83EB" />
    <circle cx="12.6" cy="5.4" r="3" fill="#5059C9" /><path d="M7.4 9.6h9.6c.6 0 1 .4 1 1v5.6a5.4 5.4 0 0 1-10.8 0v-5.4c0-.7.5-1.2 1.2-1.2z" fill="#5059C9" />
    <rect x="2" y="7" width="10.6" height="10.6" rx="1.6" fill="#4B53BC" /><path d="M4.6 9.6h5.4v1.5H8.1v4.6H6.5v-4.6H4.6z" fill="#fff" />
  </svg>
);
/** 사무실 픽토그램(말풍선 · 라임 선) — 폰 위 탭 「사무실」(형 11-13 22:05 「대화 / 팀즈 / 회의」) */
export const OfficeIcon = () => (
  <svg className="nm-tab-ic office" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.2 7.5L3 20.5l1.6-5.2A8.4 8.4 0 1 1 21 11.5z" />
  </svg>
);
