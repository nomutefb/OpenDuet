// 폰 홈 맨 위 넘김 셋째 장 「SNS」 = 큰 아이콘 셋(인스타 · 스레드 · X) · 누르면 그 앱(평범한 https 주소 = 폰이 앱으로 엶 · 안 열리면 웹)
//   (형 11-20 09:20 dm-bom 「…내 인스타그램이랑 스레드 볼 수 있었으면 좋겠음. x 까지.」 · 미토스 5.2 ② 「SNS 칸은 없애고 … 아이콘 3개만 둬. 누르면 평범한 https 주소로 앱이 열려.」 · 봄 11:41 「맨 위 넘김 셋째 장」)
//   글 0(설명글 0 · 형 11-20 10:05) · 가만히 둔 화면 = 0(그림 셋 · 받아오기 0)
import { SNS_SITES } from "../ui/sns-side";
import { SnsIcon } from "../ui/sns-card";
import "./sns-apps.css";

export function SnsApps() {
  return (
    <div className="nm-snsapps" role="group" aria-label="SNS 앱">
      {SNS_SITES.map((s) => (
        <a key={s.id} className={`nm-snsapp ${s.id}`} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name}>
          <SnsIcon site={s.id} />
        </a>
      ))}
    </div>
  );
}
