// 에러 화면 한 꼴(형 11-14 05:18 봄 옮김 「그리구 페이지 wrong 하는 에러 페이지들 잇어. 그거 이 화면으로 대체해주셈 각각 비율에 맞게끔 다크모드면 다크로 가운데는 위에움짤 느낌으로 png」)
//   = 빈 바탕 · 가운데 움짤(봄 놀람 · 사무실 스티커 /office/sticker/bom/surprise.gif) · 제목 한 줄 · 돌아가는 길 한 줄 · 폰 · PC 가운데 맞춤 · 다크 = 어둡게
//   쓰는 곳 = router.tsx defaultErrorComponent(앱 통째 깨짐 · 옛 「Something went wrong!」) · shell.tsx PaneGuard(반갈 칸 하나 깨짐 = 작은 판)
import "./oops.css";

export const OOPS_GIF = "/office/sticker/bom/surprise.gif";
const home = () => { try { location.hash = "#/"; } catch { /* 그대로 */ } location.reload(); };

export function Oops({ title = "앗, 화면이 꼬였어", sub = "잠깐 길을 잃었나 봐", small = false, retry }: { title?: string; sub?: string; small?: boolean; retry?: () => void }) {
  return (
    <div className={`nm-oops${small ? " small" : ""}`} role="alert">
      <img src={OOPS_GIF} alt="" width={small ? 72 : 168} height={small ? 72 : 168} />
      <b>{title}</b>
      <small>{sub}</small>
      <p>
        <button type="button" onClick={() => (retry ? retry() : location.reload())}>다시 열기</button>
        {small ? null : <><span aria-hidden>·</span><button type="button" onClick={home}>정원으로 돌아가기</button></>}
      </p>
    </div>
  );
}
