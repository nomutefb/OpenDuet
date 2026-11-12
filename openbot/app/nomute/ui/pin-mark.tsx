// 고정 표시 한 벌 = 작은 압정 그림(봄 11-12 16:17 「A(핀 그림 · 얼굴 왼쪽 위 작은 압정)로 정했어」 · 형 14:06 「채팅방 인앱에서 고정하는거 점으로 하지말고 좀 더 다른거로 해보자」)
//   PC 얼굴 띠(.nm-face-pin · 얼굴 왼쪽 위 동그란 판) · 폰 대화 목록(.nm-pin-mark · 이름 줄 끝) 둘 다 이 그림 하나 — 한 번 고치면 둘 다(형 11-11 「하네스가 참조처럼」)
export function PinMark({ className, label }: { className: string; label: string }) {
  return (
    <i className={className} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 4h6l-1 5 3 3H7l3-3z" /><path d="M12 12v8" /></svg>
    </i>
  );
}
