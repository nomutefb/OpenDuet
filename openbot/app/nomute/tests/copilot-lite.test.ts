import assert from "node:assert/strict";
import test from "node:test";
import { exceedsMaxSize, formatFileSize, matchesAcceptFilter, modalityOf, resolveMaxConcurrentUploads } from "../shim/copilot-lite.ts";

test("첨부 종류 = 그림·영상·소리 아니면 문서(원본 getModalityFromMimeType 뜻)", () => {
  assert.equal(modalityOf("image/png"), "image");
  assert.equal(modalityOf("video/mp4"), "video");
  assert.equal(modalityOf("audio/mpeg"), "audio");
  assert.equal(modalityOf("application/pdf"), "document");
  assert.equal(modalityOf(""), "document");
  assert.equal(modalityOf(undefined), "document");
});

test("accept 거름 — */* 는 다 받고 · .확장자 = 이름 끝 · image/* = 앞머리 · 그 밖 = 그대로", () => {
  const png = { name: "a.PNG", type: "image/png" }, txt = { name: "n.txt", type: "" };
  assert.equal(matchesAcceptFilter(png, "*/*"), true);
  assert.equal(matchesAcceptFilter(txt, undefined), true);
  assert.equal(matchesAcceptFilter(png, "image/*"), true);
  assert.equal(matchesAcceptFilter(txt, "image/*"), false);
  assert.equal(matchesAcceptFilter(txt, ".txt,.md"), true);   // 꼴 없는 글 파일 = 이름 끝으로
  assert.equal(matchesAcceptFilter(png, ".png"), true);   // 대소문자 안 가림
  assert.equal(matchesAcceptFilter(png, "image/jpeg"), false);
  assert.equal(matchesAcceptFilter(png, "image/jpeg, image/png"), true);
});

test("크기 문턱 · 글자 · 동시 올리기 수(원본과 같은 값)", () => {
  assert.equal(exceedsMaxSize({ size: 11 }, 10), true);
  assert.equal(exceedsMaxSize({ size: 10 }, 10), false);
  assert.equal(formatFileSize(512), "512 B");
  assert.equal(formatFileSize(20 * 1024 * 1024), "20.0 MB");
  assert.equal(resolveMaxConcurrentUploads(undefined), 1);
  assert.equal(resolveMaxConcurrentUploads(Number.NaN), 1);
  assert.equal(resolveMaxConcurrentUploads(0), 1);
  assert.equal(resolveMaxConcurrentUploads(2.7), 2);
  assert.equal(resolveMaxConcurrentUploads(Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY);
});
