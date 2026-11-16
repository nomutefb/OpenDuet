// 문서 만들기 · 점검 엔진 — hwpx-docs(파이썬 · BlackBuddle/hwpx-docs 0.3.0 · AGPL-3.0 · 고치지 않음)를 브라우저 안 파이썬(Pyodide)에서 그대로 돌림 = 서버 0 · 한글 0
//   형 11-17 「한글 파일을 구성을 할 수 있게 … 한글을 안키고도」 · 「웅 우리끼리 쓸거맞음. 그 부분으로해줘. 근데 아까 너가 찾은 부분 강점을 섞어도 좋지」 — 만들기 · 점검 = 이 엔진 / 열기 · 고치기 · 저장 = rhwp 편집기(./doc-editor.tsx)
//   묶음 = public/hwp/hwpx-docs-0.3.0.zip(코드 + 틀 · 530KB · 싸는 법 ./pack-hwpx-docs.py) · 파이썬 = jsDelivr 의 pyodide(처음 한 번 약 13MB · 그 뒤 브라우저 캐시)
//   일꾼(Worker) 안에서 돎 = 만드는 0.1 ~ 1초 동안 화면이 안 멈춤 · 일꾼은 처음 부를 때 뜸(문서 편집 창만 연 사람은 안 받음)
//   부르는 꼴 = hwpx-docs 명령 줄 그대로(argv) · 파일은 /work/<이름> 으로 주고받음 · 시험(node · 브라우저) = 명령 열둘 통과(11-17)
export const PYODIDE = "https://cdn.jsdelivr.net/npm/pyodide@314.0.8/";
export const HD_PACK = "hwp/hwpx-docs-0.3.0.zip";

export type HdIn = Record<string, Uint8Array | string>;
export type HdOut = { code: number; log: string; files: Record<string, Uint8Array> };

/** 파이썬 쪽 받침 — hd.py main 이 하는 일(명령 → 모듈 · runpy)을 그대로 · 표준 출력만 글로 모음 */
const BOOT = `
import sys, io, runpy, contextlib, importlib.util, traceback
sys.path.insert(0, '/hd/lib')
_spec = importlib.util.spec_from_file_location('_hd_cli', '/hd/lib/hd.py')
_cli = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_cli)
def hd_run(argv):
    argv = list(argv)
    from hwpx_docs.core import registry
    mod, pre, _ = registry.commands().get(argv[0]) or (_cli.COMMANDS.get(argv[0]), [], '')
    if not mod:
        return '2\\nunknown command: ' + argv[0]
    buf = io.StringIO(); code = 0; keep = sys.argv
    sys.argv = ['hd ' + argv[0]] + list(pre) + argv[1:]
    with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
        try:
            runpy.run_module('hwpx_docs.' + mod, run_name='__main__', alter_sys=True)
        except SystemExit as e:
            code = e.code if isinstance(e.code, int) else (0 if e.code is None else 1)
            if e.code and not isinstance(e.code, int): print(e.code)
        except BaseException:
            traceback.print_exc(file=buf); code = 1
    sys.argv = keep
    return str(code) + '\\n' + '\\n'.join(l for l in buf.getvalue().split('\\n') if 'RuntimeWarning' not in l)
`;

/** 일꾼 글 — 모듈 일꾼(Blob) · 주소는 다 절대 주소로 받음(Blob 안에선 상대 주소가 안 풀림) */
export const workerSource = (pyodide: string) => `
import { loadPyodide } from ${JSON.stringify(pyodide + "pyodide.mjs")};
let ready = null;
const boot = (pack) => (ready ??= (async () => {
  const py = await loadPyodide({ indexURL: ${JSON.stringify(pyodide)} });
  const r = await fetch(pack);
  if (!r.ok) throw new Error("문서 엔진 묶음을 못 받음(HTTP " + r.status + ")");
  py.unpackArchive(await r.arrayBuffer(), "zip", { extractDir: "/hd" });
  py.FS.mkdirTree("/work");
  py.runPython(${JSON.stringify(BOOT)});
  return py;
})().catch((e) => { ready = null; throw e; }));
self.onmessage = async (e) => {
  const { id, pack, argv, inputs, outputs } = e.data;
  try {
    const py = await boot(pack);
    for (const [n, b] of Object.entries(inputs || {})) py.FS.writeFile("/work/" + n, b);
    const fn = py.globals.get("hd_run"), a = py.toPy(argv);
    let raw; try { raw = fn(a); } finally { a.destroy(); fn.destroy(); }
    const nl = raw.indexOf("\\n"), files = {}, move = [];
    for (const n of outputs || []) { try { const b = py.FS.readFile("/work/" + n); files[n] = b; move.push(b.buffer); } catch { /* 안 나온 파일 = 빈 채로 */ } }
    for (const n of py.FS.readdir("/work")) { if (n !== "." && n !== "..") { try { py.FS.unlink("/work/" + n); } catch { /* 폴더는 둠 */ } } }
    self.postMessage({ id, code: Number(raw.slice(0, nl)), log: raw.slice(nl + 1).trim(), files }, move);
  } catch (err) { self.postMessage({ id, error: String((err && err.message) || err) }); }
};
`;

const FIRST_MS = 120_000, EACH_MS = 60_000;   // 처음 = 파이썬 받는 시간 포함
let worker: Worker | null = null, seq = 0, booted = false;
const waits = new Map<number, { ok: (v: HdOut) => void; no: (e: Error) => void; timer: number }>();

function drop(why: string) {   // 일꾼이 죽음 = 기다리던 것 다 실패로 · 다음 부름이 새로 띄움
  worker?.terminate(); worker = null; booted = false;
  for (const w of waits.values()) { clearTimeout(w.timer); w.no(new Error(why)); }
  waits.clear();
}

function ensure(): Worker {
  if (worker) return worker;
  const url = URL.createObjectURL(new Blob([workerSource(PYODIDE)], { type: "text/javascript" }));
  const w = new Worker(url, { type: "module" });
  w.onmessage = (e: MessageEvent<{ id: number; code?: number; log?: string; files?: Record<string, Uint8Array>; error?: string }>) => {
    const d = e.data, at = waits.get(d.id);
    if (!at) return;
    waits.delete(d.id); clearTimeout(at.timer);
    if (d.error) at.no(new Error(d.error)); else { booted = true; at.ok({ code: d.code ?? 1, log: d.log ?? "", files: d.files ?? {} }); }
  };
  w.onerror = (e) => drop(`문서 엔진이 멈췄어 — ${e.message || "일꾼 오류"}`);
  worker = w;
  return w;
}

/** hwpx-docs 명령 하나 — 예: hd(["md", "/work/in.md", "/work/out.hwpx"], { "in.md": 글 }, ["out.hwpx"]) */
export function hd(argv: string[], inputs: HdIn = {}, outputs: string[] = []): Promise<HdOut> {
  return new Promise((ok, no) => {
    const id = ++seq, w = ensure();
    const timer = window.setTimeout(() => { if (waits.has(id)) drop("문서 엔진이 너무 오래 걸려서 멈췄어 — 다시 눌러 줘"); }, booted ? EACH_MS : FIRST_MS);
    waits.set(id, { ok, no, timer });
    w.postMessage({ id, pack: new URL(import.meta.env.BASE_URL + HD_PACK, location.href).href, argv, inputs, outputs });
  });
}

/** 미리 데우기 — 「만들기」 판을 열 때(누르기 전에 파이썬을 받아 둠) */
export const warmHd = () => { void hd(["text", "/work/none.hwpx"]).catch(() => {}); };
