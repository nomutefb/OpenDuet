import { expect, test } from "bun:test";
import { sharedText } from "../ui/news-data";

// 3초 안 같은 주소 = 한 번만 받음(빠르 11-14 · 첫 화면 articles.json 세 번 → 한 번)
test("같은 주소를 한꺼번에 셋이 부르면 fetch 1번 · 다른 주소는 따로", async () => {
  let n = 0;
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => { n++; return new Response('{"a":1}', { status: 200 }); }) as unknown as typeof fetch;
  try {
    const [a, b, c] = await Promise.all([sharedText("/x.json"), sharedText("/x.json"), sharedText("/x.json")]);
    expect(n).toBe(1);
    expect(a.text).toBe('{"a":1}'); expect(b.status).toBe(200); expect(c.text).toBe(a.text);
    await sharedText("/y.json");
    expect(n).toBe(2);
  } finally { globalThis.fetch = orig; }
});

test("실패한 받기는 나누지 않음(다음 부름 = 새로)", async () => {
  let n = 0;
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => { n++; throw new Error("끊김"); }) as unknown as typeof fetch;
  try {
    await expect(sharedText("/z.json")).rejects.toThrow();
    await Promise.resolve();
    await expect(sharedText("/z.json")).rejects.toThrow();
    expect(n).toBe(2);
  } finally { globalThis.fetch = orig; }
});
