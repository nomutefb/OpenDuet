// 우리 이야기 「더 보기」(천둥 11-20 04:20 · 서버 #4408 「첫 목록 GET stories 답에 more:true 가 오면 목록 끝에 「더 보기」 단추 · 누르면 GET stories?before=<지금 목록 맨 끝 글 id> → 그 앞 200편」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mergeStories, oldestId } from "../ui/stories";

test("맨 끝 글 id = 가장 작은 id(글 id 앞 13자리 = 시각) · 겹치면 한 번 · 새것부터 · 옛 윈터 글 뺌", () => {
  assert.equal(oldestId([{ id: "1795-b" }, { id: "1700-a" }, { id: "1790-c" }]), "1700-a");
  assert.equal(oldestId([]), "");
  const a = [{ id: "3", ts: 3, who: "봄", title: "c" }, { id: "2", ts: 2, who: "시아", title: "b" }];
  const b = [{ id: "2", ts: 2, who: "시아", title: "b" }, { id: "1", ts: 1, who: "윈터", title: "옛 윈터" }, { id: "0", ts: 0, who: "깃", title: "a" }];
  assert.deepEqual(mergeStories(a, b).map((s) => s.id), ["3", "2", "0"]);
});

test("누를 때만 읽음 · more:false 면 숨김 · cut 글은 펼칠 때만 ?id=", () => {
  const s = readFileSync(new URL("../ui/stories.tsx", import.meta.url), "utf8");
  assert.match(s, /office<\{ items\?: Story\[\]; more\?: boolean \}>\(`stories\?before=\$\{encodeURIComponent\(last\)\}`\)/);
  assert.match(s, /setOlderMore\(!!j\.more && got\.length > 0\)/);
  assert.match(s, /\{hasMore \? <button type="button" className="yset-chip nm-story-more"/);
  assert.match(s, /enabled: on && !!s\.cut/);
});
