import { test } from "node:test";
import assert from "node:assert/strict";
import { nameLabelBorder, nameLabelColor } from "../ui/name-label-color.ts";

type RGB = readonly [number, number, number];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

// Check the emitted colour independently of the implementation's search/rounding.
function rgb(hex: string): RGB {
  assert.match(hex, /^#[0-9a-f]{6}$/i, "labels must emit an opaque six-digit colour");
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function luminance(channels: RGB): number {
  const [r, g, b] = channels.map((channel) => {
    const s = channel / 255;
    return s > 0.04045 ? Math.pow((s + 0.055) / 1.055, 2.4) : s / 12.92;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: RGB, b: RGB): number {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function over(colour: RGB, backdrop: RGB, opacity: number): RGB {
  return colour.map((channel, i) => channel * opacity + backdrop[i] * (1 - opacity)) as unknown as RGB;
}
function assertReadable(output: string, context: string): void {
  const colour = rgb(output);
  assert.ok(contrast(WHITE, colour) >= 7, `${context}: opaque white text must meet the 7:1 target (${output})`);
  // Expanded bot-to-bot conversations use opacity .9 on the whole subtree.
  // Both label text and background are composited with the surrounding theme.
  for (const backdrop of [WHITE, BLACK]) {
    const actual = contrast(over(WHITE, backdrop, 0.9), over(colour, backdrop, 0.9));
    assert.ok(actual > 4.5, `${context}: .9 opacity on ${backdrop[0]} backdrop gives only ${actual}:1 (${output})`);
  }
}

test("bright signature colours become readable with white text in both themes", () => {
  for (const signature of ["#FFFFFF", "#CFFF40", "#FFB300", "#DDE3EA", "#FF6FB5", "#22D3EE", "#FFD60A", "#00FFFF", "#00FF00", "#FF0000"]) {
    const output = nameLabelColor(signature);
    assertReadable(output, signature);
    assert.notEqual(output.toLowerCase(), signature.toLowerCase(), `${signature} is too bright to preserve`);
  }
});

test("already-dark signature colours retain their exact RGB channels", () => {
  for (const signature of ["#000000", "#121212", "#161716", "#102030", "#000080", "#004000", "#600000", "#0000FF"]) {
    assert.ok(contrast(WHITE, rgb(signature)) >= 7, "fixture must already meet the target");
    const output = nameLabelColor(signature);
    assert.deepEqual(rgb(output), rgb(signature));
    assertReadable(output, signature);
  }
});

test("unknown and invalid colours use one readable opaque fallback", () => {
  const fallback = nameLabelColor();
  assertReadable(fallback, "unknown");
  for (const signature of ["", " ", "#", "#12", "#12345", "#1234567", "#123456789", "#gggggg", "red", "transparent", "rgb(255,255,255)", "var(--signature)"]) {
    assert.equal(nameLabelColor(signature), fallback, `invalid input: ${signature}`);
  }
});

test("short hex and alpha-bearing signatures resolve to the same opaque RGB", () => {
  for (const [short, full] of [["#fff", "#ffffff"], ["#0f0", "#00ff00"], ["#123", "#112233"], ["#AbC", "#AAbbCC"]]) {
    assert.equal(nameLabelColor(short).toLowerCase(), nameLabelColor(full).toLowerCase());
    for (const alpha of ["0", "8", "f"]) {
      const output = nameLabelColor(short + alpha);
      assert.equal(output.toLowerCase(), nameLabelColor(full).toLowerCase());
      assertReadable(output, short + alpha);
    }
    for (const alpha of ["00", "4d", "80", "ff"]) {
      const output = nameLabelColor(full + alpha);
      assert.equal(output.toLowerCase(), nameLabelColor(full).toLowerCase());
      assertReadable(output, full + alpha);
    }
  }
  assert.equal(nameLabelColor("  #123  "), nameLabelColor("#123"));
});

test("On's translucent red signature becomes an opaque readable label", () => {
  const output = nameLabelColor("#FF3E0EC2");
  assert.equal(output, nameLabelColor("#FF3E0E"));
  assertReadable(output, "On #FF3E0EC2");
  const [r, g, b] = rgb(output);
  assert.ok(r > g && g > b, "darkening should retain the red-orange signature");
});

test("17-step RGB grid keeps white text above 4.5:1 even inside the .9 opacity conversation", () => {
  for (let r = 0; r <= 255; r += 17) {
    for (let g = 0; g <= 255; g += 17) {
      for (let b = 0; b <= 255; b += 17) {
        const signature = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
        const output = nameLabelColor(signature);
        assertReadable(output, signature);
        if (contrast(WHITE, [r, g, b]) >= 7) assert.deepEqual(rgb(output), [r, g, b], `dark colour changed: ${signature}`);
      }
    }
  }
});

test("17-step RGB grid has a lighter opaque border with at least 3:1 label contrast", () => {
  for (let r = 0; r <= 255; r += 17) {
    for (let g = 0; g <= 255; g += 17) {
      for (let b = 0; b <= 255; b += 17) {
        const signature = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
        const background = nameLabelColor(signature);
        const base = rgb(background), border = rgb(nameLabelBorder(background));
        const actual = contrast(border, base);
        assert.ok(actual >= 3, `${signature}: border-to-label contrast is only ${actual}:1`);
        assert.ok(border.every((channel, i) => channel >= base[i]), `${signature}: border must lighten toward white`);
      }
    }
  }
});
