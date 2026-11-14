// 창 X 하나 — 판(다이얼로그) 오른쪽 위 닫기 하네스(#-042 · 형 11-15 07:55 「이거는 닫기 버튼을 두는게 아니라. 창에 x 버튼을 통일시켜서 하네스로 맞추자」)
//   판 안 「닫기」 글자 단추 대신 이것 하나 · 판 상자에 relative 만 있으면 됨 · 누름 = 그 판의 닫기 길(쓰던 중이면 ./save-ask CloseAsk 확인)
import { DuetIcon } from "@/components/duet/icons";
import "./dialog-x.css";

export function DialogX({ onClose, label = "닫기", disabled }: { onClose: () => void; label?: string; disabled?: boolean }) {
  return <button type="button" className="nm-dx" aria-label={label} title={label} disabled={disabled} onClick={onClose}><DuetIcon name="x" size={18} /></button>;
}
