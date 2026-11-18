/* useAnimations 플레이어(Lottie 서브셋 SVG 렌더러) — nomutefb/react-useanimations@1df0946(업스트림 useAnimations/react-useanimations 3.1.1 · 035f164) src/player/*.ts 를
   타입만 벗겨 한 모듈로 묶은 사본(로직 무변경). React 래퍼는 안 가져옴. 쓰는 곳 = viewer/nm-ua.js(누름 재생) 하나.
   bezier.ts 는 lottie-web(MIT, Airbnb) 포팅분. 아래 원 저작권·MIT 고지 전문을 지운다 금지.

   MIT License
   
   Copyright (c) 2018-2026 useAnimations (https://useanimations.com)
   
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:
   
   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.
   
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
*/
// ── bezier.ts
const CURVE_SEGMENTS = 150;
const NEWTON_ITERATIONS = 4;
const SAMPLES = 11;
const SAMPLE_STEP = 1 / (SAMPLES - 1);
const coefficients = (p1, p2)=>[
        1 - 3 * p2 + 3 * p1,
        3 * p2 - 6 * p1,
        3 * p1
    ];
const calc = (t, [a, b, c])=>((a * t + b) * t + c) * t;
const slope = (t, [a, b, c])=>3 * a * t * t + 2 * b * t + c;
const easings = new Map();
const easing = (x1, y1, x2, y2)=>{
    const key = `${x1},${y1},${x2},${y2}`;
    let fn = easings.get(key);
    if (fn) return fn;
    if (x1 === y1 && x2 === y2) {
        fn = (x)=>x;
    } else {
        const cx = coefficients(x1, x2);
        const cy = coefficients(y1, y2);
        const samples = Array.from({
            length: SAMPLES
        }, (_, i)=>calc(i * SAMPLE_STEP, cx));
        const tForX = (x)=>{
            let start = 0;
            let i = 1;
            for(; i !== SAMPLES - 1 && samples[i] <= x; i += 1)start += SAMPLE_STEP;
            i -= 1;
            let t = start + (x - samples[i]) / (samples[i + 1] - samples[i]) * SAMPLE_STEP;
            const initialSlope = slope(t, cx);
            if (initialSlope >= 0.001) {
                for(let n = 0; n < NEWTON_ITERATIONS; n += 1){
                    const currentSlope = slope(t, cx);
                    if (currentSlope === 0) break;
                    t -= (calc(t, cx) - x) / currentSlope;
                }
                return t;
            }
            if (initialSlope === 0) return t;
            let a = start;
            let b = start + SAMPLE_STEP;
            for(let n = 0; n < 10; n += 1){
                t = a + (b - a) / 2;
                const value = calc(t, cx) - x;
                if (Math.abs(value) <= 0.0000001) break;
                if (value > 0) b = t;
                else a = t;
            }
            return t;
        };
        fn = (x)=>x <= 0 ? 0 : x >= 1 ? 1 : calc(tForX(x), cy);
    }
    easings.set(key, fn);
    return fn;
};
const segmentLength = (p1, p2, c1, c2)=>{
    const percents = [];
    const lengths = [];
    let total = 0;
    let lastX = 0;
    let lastY = 0;
    for(let k = 0; k < CURVE_SEGMENTS; k += 1){
        const t = k / (CURVE_SEGMENTS - 1);
        const u = 1 - t;
        const x = u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0];
        const y = u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1];
        if (k > 0) total += Math.hypot(x - lastX, y - lastY);
        lastX = x;
        lastY = y;
        percents[k] = t;
        lengths[k] = total;
    }
    return {
        percents,
        lengths,
        total
    };
};
const distancePercent = (perc, { percents, lengths, total })=>{
    const len = percents.length;
    let pos = Math.floor((len - 1) * perc);
    const target = perc * total;
    if (pos === len - 1 || pos === 0 || target === lengths[pos]) return percents[pos];
    const dir = lengths[pos] > target ? -1 : 1;
    for(;;){
        if (lengths[pos] <= target && lengths[pos + 1] > target) {
            const local = (target - lengths[pos]) / (lengths[pos + 1] - lengths[pos]);
            return percents[pos] + (percents[pos + 1] - percents[pos]) * local;
        }
        pos += dir;
        if (pos < 0 || pos >= len - 1) return percents[Math.max(0, Math.min(pos, len - 1))];
    }
};
const round3 = (value)=>Math.round(value * 1000) / 1000;
const splitSegment = (p1, p2, c1, c2, startPerc, endPerc, data)=>{
    const t0 = distancePercent(Math.min(Math.max(startPerc, 0), 1), data);
    const t1 = distancePercent(Math.min(endPerc, 1), data);
    const u0 = 1 - t0;
    const u1 = 1 - t1;
    const point = (i)=>[
            round3(u0 * u0 * u0 * p1[i] + 3 * t0 * u0 * u0 * c1[i] + 3 * t0 * t0 * u0 * c2[i] + t0 * t0 * t0 * p2[i]),
            round3(u0 * u0 * u1 * p1[i] + (t0 * u0 * u1 + u0 * t0 * u1 + u0 * u0 * t1) * c1[i] + (t0 * t0 * u1 + u0 * t0 * t1 + t0 * u0 * t1) * c2[i] + t0 * t0 * t1 * p2[i]),
            round3(u0 * u1 * u1 * p1[i] + (t0 * u1 * u1 + u0 * t1 * u1 + u0 * u1 * t1) * c1[i] + (t0 * t1 * u1 + u0 * t1 * t1 + t0 * u1 * t1) * c2[i] + t0 * t1 * t1 * p2[i]),
            round3(u1 * u1 * u1 * p1[i] + 3 * t1 * u1 * u1 * c1[i] + 3 * t1 * t1 * u1 * c2[i] + t1 * t1 * t1 * p2[i])
        ];
    const x = point(0);
    const y = point(1);
    return x.map((value, i)=>[
            value,
            y[i]
        ]);
};
const onLine = (x1, y1, x2, y2, x3, y3)=>{
    const det = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
    return det > -0.001 && det < 0.001;
};
const spatialCache = new Map();
const spatialBezier = (start, end, to, ti)=>{
    const key = [
        ...start,
        ...end,
        ...to,
        ...ti
    ].join('_');
    let data = spatialCache.get(key);
    if (data) return data;
    const straight = (start[0] !== end[0] || start[1] !== end[1]) && onLine(start[0], start[1], end[0], end[1], start[0] + to[0], start[1] + to[1]) && onLine(start[0], start[1], end[0], end[1], end[0] + ti[0], end[1] + ti[1]);
    const segments = straight ? 2 : CURVE_SEGMENTS;
    const points = [];
    let total = 0;
    let last;
    for(let k = 0; k < segments; k += 1){
        const t = k / (segments - 1);
        const u = 1 - t;
        const point = start.map((s, i)=>u * u * u * s + 3 * u * u * t * (s + (to[i] ?? 0)) + 3 * u * t * t * (end[i] + (ti[i] ?? 0)) + t * t * t * end[i]);
        const partial = last ? Math.hypot(...point.map((v, i)=>v - last[i])) : 0;
        total += partial;
        points.push({
            partial,
            point
        });
        last = point;
    }
    data = {
        total,
        points
    };
    spatialCache.set(key, data);
    return data;
};
const pointAlong = ({ total, points }, perc)=>{
    const distance = total * perc;
    let added = 0;
    for(let j = 0; j < points.length; j += 1){
        added += points[j].partial;
        if (distance === 0 || perc === 0 || j === points.length - 1) return points[j].point;
        const next = points[j + 1].partial;
        if (distance >= added && distance < added + next) {
            const local = (distance - added) / next;
            return points[j].point.map((v, i)=>v + (points[j + 1].point[i] - v) * local);
        }
    }
    return points[points.length - 1].point;
};

// ── matrix.ts
const identity = ()=>[
        1,
        0,
        0,
        1,
        0,
        0
    ];
const isIdentity = (m)=>m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;
const multiply = (m, n)=>[
        m[0] * n[0] + m[1] * n[2],
        m[0] * n[1] + m[1] * n[3],
        m[2] * n[0] + m[3] * n[2],
        m[2] * n[1] + m[3] * n[3],
        m[4] * n[0] + m[5] * n[2] + n[4],
        m[4] * n[1] + m[5] * n[3] + n[5]
    ];
const translate = (m, x, y)=>x === 0 && y === 0 ? m : [
        m[0],
        m[1],
        m[2],
        m[3],
        m[4] + x,
        m[5] + y
    ];
const scale = (m, x, y)=>x === 1 && y === 1 ? m : multiply(m, [
        x,
        0,
        0,
        y,
        0,
        0
    ]);
const rotate = (m, angle)=>{
    if (angle === 0) return m;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return multiply(m, [
        cos,
        sin,
        -sin,
        cos,
        0,
        0
    ]);
};
const skewFromAxis = (m, skew, axis)=>{
    if (skew === 0) return m;
    const cos = Math.cos(axis);
    const sin = Math.sin(axis);
    const rotated = multiply(m, [
        cos,
        sin,
        -sin,
        cos,
        0,
        0
    ]);
    return multiply(multiply(rotated, [
        1,
        0,
        Math.tan(skew),
        1,
        0,
        0
    ]), [
        cos,
        -sin,
        sin,
        cos,
        0,
        0
    ]);
};
const invert = (m)=>{
    const det = m[0] * m[3] - m[1] * m[2];
    return [
        m[3] / det,
        -m[1] / det,
        -m[2] / det,
        m[0] / det,
        (m[2] * m[5] - m[3] * m[4]) / det,
        -(m[0] * m[5] - m[1] * m[4]) / det
    ];
};
const round = (value)=>Math.round(value * 100) / 100;
const applyToPoint = (m, x, y)=>isIdentity(m) ? `${x},${y}` : `${round(x * m[0] + y * m[2] + m[4])},${round(x * m[1] + y * m[3] + m[5])}`;
const round4 = (value)=>Math.round(value * 10000) / 10000;
const toCss = (m)=>`matrix(${m.map(round4).join(',')})`;

// ── properties.ts

const constant = (value)=>({
        animated: false,
        at: ()=>value
    });
const isKeyframed = (k)=>Array.isArray(k) && typeof k[0] === 'object' && k[0] !== null && 't' in k[0];
const component = (value, i)=>Array.isArray(value) ? value[i] ?? value[0] : value;
const ease = (out, into, i = 0)=>out && into ? easing(component(out.x, i), component(out.y, i), component(into.x, i), component(into.y, i)) : (x)=>x;
const segment = (keyframes, frame)=>{
    const last = keyframes.length - 1;
    for(let i = 0; i < last; i += 1){
        const next = keyframes[i + 1];
        if (i === last - 1 && frame >= next.t) {
            return {
                key: keyframes[i].h ? next : keyframes[i],
                next
            };
        }
        if (next.t > frame) return {
            key: keyframes[i],
            next
        };
    }
    return {
        key: keyframes[last - 1],
        next: keyframes[last]
    };
};
const vectorAt = (keyframes, frame)=>{
    const { key, next } = segment(keyframes, frame);
    const start = key.s;
    const end = next.s ?? key.e ?? start;
    if (key.to) {
        const data = spatialBezier(start, end, key.to, key.ti ?? []);
        if (frame >= next.t || frame < key.t) {
            return data.points[frame >= next.t ? data.points.length - 1 : 0].point;
        }
        return pointAlong(data, ease(key.o, key.i)((frame - key.t) / (next.t - key.t)));
    }
    return start.map((s, i)=>{
        if (key.h === 1) return s;
        const perc = frame >= next.t ? 1 : frame < key.t ? 0 : ease(key.o, key.i, i)((frame - key.t) / (next.t - key.t));
        return s + (end[i] - s) * perc;
    });
};
const toVector = (value, fallback)=>value === undefined ? fallback : typeof value === 'number' ? [
        value
    ] : value;
const random = (seed)=>()=>{
        seed = seed + 0x6d2b79f5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
const expression = (source, frameRate)=>{
    if (/loopOut\(\s*(['"]cycle['"])?\s*\)/.test(source)) {
        return (at, keyframes)=>({
                animated: true,
                at: (frame)=>{
                    if (!keyframes) return at(frame);
                    const first = keyframes[0].t;
                    const last = keyframes[keyframes.length - 1].t;
                    return frame <= last ? at(frame) : at((frame - first) % (last - first) + first);
                }
            });
    }
    const wiggle = /wiggle\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/.exec(source);
    if (wiggle) {
        const amp = Number(wiggle[2]);
        return (at)=>({
                animated: true,
                at: (frame)=>{
                    const base = at(frame);
                    const periods = Math.max(frame / frameRate, 0) * 5;
                    return base.map((value, i)=>{
                        const next = random(i + 1);
                        let offset = 0;
                        for(let n = 0; n < Math.floor(periods); n += 1)offset += -amp + amp * 2 * next();
                        return value + offset + (-amp + amp * 2 * next()) * (periods - Math.floor(periods));
                    });
                }
            });
    }
    return undefined;
};
const vector = (data, fallback, ctx)=>{
    if (!data) return constant(fallback);
    const keyframes = isKeyframed(data.k) ? data.k.map((key)=>({
            ...key,
            s: key.s === undefined ? undefined : toVector(key.s, fallback),
            e: key.e === undefined ? undefined : toVector(key.e, fallback)
        })) : undefined;
    const at = keyframes && keyframes.length > 1 ? (frame)=>vectorAt(keyframes, frame) : undefined;
    const value = at ? undefined : toVector(keyframes ? keyframes[0].s : data.k, fallback);
    const base = at ? {
        animated: true,
        at
    } : constant(value);
    if (!data.x) return base;
    const apply = expression(data.x, ctx.frameRate);
    if (!apply) {
        ctx.warn(`unsupported expression ignored: ${data.x}`);
        return base;
    }
    return apply(base.at, keyframes);
};
const scalar = (data, fallback, ctx)=>{
    const v = vector(data, [
        fallback
    ], ctx);
    return v.animated ? {
        animated: true,
        at: (frame)=>v.at(frame)[0]
    } : constant(v.at(0)[0]);
};
const absolute = (path)=>({
        c: path.c,
        v: path.v,
        i: path.i.map((p, j)=>[
                p[0] + path.v[j][0],
                p[1] + path.v[j][1]
            ]),
        o: path.o.map((p, j)=>[
                p[0] + path.v[j][0],
                p[1] + path.v[j][1]
            ])
    });
const firstPath = (value)=>Array.isArray(value) ? value[0] : value;
const path = (data)=>{
    if (!isKeyframed(data.k)) return constant(absolute(firstPath(data.k)));
    const keyframes = data.k.map((key)=>({
            ...key,
            s: key.s && absolute(firstPath(key.s)),
            e: key.e && absolute(firstPath(key.e))
        }));
    const last = keyframes[keyframes.length - 1];
    return {
        animated: true,
        at: (frame)=>{
            if (frame < keyframes[0].t) return keyframes[0].s;
            if (frame >= last.t) return last.s ?? keyframes[keyframes.length - 2].e;
            let i = 0;
            while(i < keyframes.length - 2 && keyframes[i + 1].t <= frame)i += 1;
            const key = keyframes[i];
            const next = keyframes[i + 1];
            const start = key.s;
            if (key.h === 1) return start;
            const end = next.s ?? key.e;
            const perc = ease(key.o, key.i)((frame - key.t) / (next.t - key.t));
            const lerp = (a, b)=>a.map((p, j)=>[
                        p[0] + (b[j][0] - p[0]) * perc,
                        p[1] + (b[j][1] - p[1]) * perc
                    ]);
            return {
                c: start.c,
                v: lerp(start.v, end.v),
                i: lerp(start.i, end.i),
                o: lerp(start.o, end.o)
            };
        }
    };
};

// ── shapes.ts


const pathString = (path, m)=>{
    const { v, i, o } = path;
    if (!v.length) return '';
    let d = ` M${applyToPoint(m, v[0][0], v[0][1])}`;
    for(let j = 1; j < v.length; j += 1){
        d += ` C${applyToPoint(m, o[j - 1][0], o[j - 1][1])} ${applyToPoint(m, i[j][0], i[j][1])} ${applyToPoint(m, v[j][0], v[j][1])}`;
    }
    if (path.c) {
        const last = v.length - 1;
        d += ` C${applyToPoint(m, o[last][0], o[last][1])} ${applyToPoint(m, i[0][0], i[0][1])} ${applyToPoint(m, v[0][0], v[0][1])}z`;
    }
    return d;
};
const measured = new WeakMap();
const lengthsOf = (path)=>{
    const cached = measured.get(path);
    if (cached) return cached;
    const { v, i, o } = path;
    const segments = [];
    let total = 0;
    for(let j = 0; j < v.length - 1; j += 1){
        segments.push(segmentLength(v[j], v[j + 1], o[j], i[j + 1]));
        total += segments[j].total;
    }
    if (path.c && v.length) {
        const last = v.length - 1;
        segments.push(segmentLength(v[last], v[0], o[last], i[0]));
        total += segments[last].total;
    }
    const lengths = {
        segments,
        total
    };
    measured.set(path, lengths);
    return lengths;
};
const emptyPath = ()=>({
        c: false,
        v: [],
        i: [],
        o: []
    });
const addSegment = (target, pos, points, newShape)=>{
    target.o[pos] = points[1];
    target.i[pos + 1] = points[2];
    if (newShape) target.v[pos] = points[0];
    target.v[pos + 1] = points[3];
};
const addShapes = (paths, lengths, range, continued)=>{
    let target = continued ?? emptyPath();
    let count = target.v.length;
    let initPos = count;
    const shapes = [
        target
    ];
    let added = 0;
    let newShape = true;
    for(let p = 0; p < paths.length; p += 1){
        const { v, i, o, c } = paths[p];
        const segments = lengths[p].segments;
        target.c = c;
        const end = c ? segments.length : segments.length + 1;
        let j = 1;
        for(; j < end; j += 1){
            const data = segments[j - 1];
            if (added + data.total < range.s) {
                added += data.total;
                target.c = false;
            } else if (added > range.e) {
                target.c = false;
                break;
            } else {
                if (range.s <= added && range.e >= added + data.total) {
                    addSegment(target, count, [
                        v[j - 1],
                        o[j - 1],
                        i[j],
                        v[j]
                    ], newShape);
                } else {
                    const part = splitSegment(v[j - 1], v[j], o[j - 1], i[j], (range.s - added) / data.total, (range.e - added) / data.total, data);
                    addSegment(target, count, part, newShape);
                    target.c = false;
                }
                newShape = false;
                added += data.total;
                count += 1;
            }
        }
        if (c && segments.length) {
            const data = segments[j - 1];
            if (added <= range.e) {
                if (range.s <= added && range.e >= added + data.total) {
                    addSegment(target, count, [
                        v[j - 1],
                        o[j - 1],
                        i[0],
                        v[0]
                    ], newShape);
                } else {
                    const part = splitSegment(v[j - 1], v[0], o[j - 1], i[0], (range.s - added) / data.total, (range.e - added) / data.total, data);
                    addSegment(target, count, part, newShape);
                    target.c = false;
                }
                newShape = false;
            } else {
                target.c = false;
            }
            added += data.total;
            count += 1;
        }
        if (target.v.length > initPos) {
            target.i[initPos] = [
                ...target.v[initPos]
            ];
            target.o[target.v.length - 1] = [
                ...target.v[target.v.length - 1]
            ];
        }
        if (added > range.e) break;
        if (p < paths.length - 1) {
            target = emptyPath();
            newShape = true;
            shapes.push(target);
            count = 0;
            initPos = 0;
        }
    }
    return shapes;
};
const trim = (paths, start, end, offset)=>{
    let o = offset % 360 / 360;
    if (o < 0) o += 1;
    let s = (start > 1 ? 1 : start < 0 ? 0 : start) + o;
    let e = (end > 1 ? 1 : end < 0 ? 0 : end) + o;
    if (s > e) [s, e] = [
        e,
        s
    ];
    s = Math.round(s * 10000) * 0.0001;
    e = Math.round(e * 10000) * 0.0001;
    if (s === e) return [];
    if (e === 1 && s === 0 || e === 0 && s === 1) return paths;
    const lengths = paths.map(lengthsOf);
    const total = lengths.reduce((sum, l)=>sum + l.total, 0);
    const ranges = e <= 1 ? [
        {
            s: total * s,
            e: total * e
        }
    ] : s >= 1 ? [
        {
            s: total * (s - 1),
            e: total * (e - 1)
        }
    ] : [
        {
            s: total * s,
            e: total
        },
        {
            s: 0,
            e: total * (e - 1)
        }
    ];
    if (ranges[0].s === ranges[0].e) return [];
    const result = [];
    let shapes = addShapes(paths, lengths, ranges[0]);
    if (ranges.length > 1) {
        const continued = paths[paths.length - 1].c ? shapes.pop() : undefined;
        result.push(...shapes);
        shapes = addShapes(paths, lengths, ranges[1], continued);
    }
    result.push(...shapes);
    return result;
};
const ROUND = 0.5519;
const ellipse = ([px, py], [sx, sy], reversed)=>{
    const w = sx / 2;
    const h = sy / 2;
    const cw = reversed ? -1 : 1;
    return {
        c: true,
        v: [
            [
                px,
                py - h
            ],
            [
                px + w * cw,
                py
            ],
            [
                px,
                py + h
            ],
            [
                px - w * cw,
                py
            ]
        ],
        i: [
            [
                px - w * ROUND * cw,
                py - h
            ],
            [
                px + w * cw,
                py - h * ROUND
            ],
            [
                px + w * ROUND * cw,
                py + h
            ],
            [
                px - w * cw,
                py + h * ROUND
            ]
        ],
        o: [
            [
                px + w * ROUND * cw,
                py - h
            ],
            [
                px + w * cw,
                py + h * ROUND
            ],
            [
                px - w * ROUND * cw,
                py + h
            ],
            [
                px - w * cw,
                py - h * ROUND
            ]
        ]
    };
};
const rectangle = ([px, py], [sx, sy], roundness, reversed)=>{
    const w = sx / 2;
    const h = sy / 2;
    const r = Math.min(w, h, roundness);
    const k = r * (1 - ROUND);
    const points = r ? [
        [
            [
                px + w,
                py - h + r
            ],
            [
                px + w,
                py - h + r
            ],
            [
                px + w,
                py - h + k
            ]
        ],
        [
            [
                px + w,
                py + h - r
            ],
            [
                px + w,
                py + h - k
            ],
            [
                px + w,
                py + h - r
            ]
        ],
        [
            [
                px + w - r,
                py + h
            ],
            [
                px + w - r,
                py + h
            ],
            [
                px + w - k,
                py + h
            ]
        ],
        [
            [
                px - w + r,
                py + h
            ],
            [
                px - w + k,
                py + h
            ],
            [
                px - w + r,
                py + h
            ]
        ],
        [
            [
                px - w,
                py + h - r
            ],
            [
                px - w,
                py + h - r
            ],
            [
                px - w,
                py + h - k
            ]
        ],
        [
            [
                px - w,
                py - h + r
            ],
            [
                px - w,
                py - h + k
            ],
            [
                px - w,
                py - h + r
            ]
        ],
        [
            [
                px - w + r,
                py - h
            ],
            [
                px - w + r,
                py - h
            ],
            [
                px - w + k,
                py - h
            ]
        ],
        [
            [
                px + w - r,
                py - h
            ],
            [
                px + w - k,
                py - h
            ],
            [
                px + w - r,
                py - h
            ]
        ]
    ] : [
        [
            [
                px + w,
                py - h
            ],
            [
                px + w,
                py - h
            ],
            [
                px + w,
                py - h
            ]
        ],
        [
            [
                px + w,
                py + h
            ],
            [
                px + w,
                py + h
            ],
            [
                px + w,
                py + h
            ]
        ],
        [
            [
                px - w,
                py + h
            ],
            [
                px - w,
                py + h
            ],
            [
                px - w,
                py + h
            ]
        ],
        [
            [
                px - w,
                py - h
            ],
            [
                px - w,
                py - h
            ],
            [
                px - w,
                py - h
            ]
        ]
    ];
    if (reversed) {
        points.reverse();
        for (const point of points)[point[1], point[2]] = [
            point[2],
            point[1]
        ];
    }
    return {
        c: true,
        v: points.map((point)=>point[0]),
        o: points.map((point)=>point[1]),
        i: points.map((point)=>point[2])
    };
};

// ── render.ts


const SVG = 'http://www.w3.org/2000/svg';
let prefix;
let uid = 0;
const newId = ()=>{
    prefix ??= `__ua${Math.random().toString(36).slice(2, 8)}_`;
    return `${prefix}${uid += 1}`;
};
const create = (name, attrs = {})=>{
    const element = document.createElementNS(SVG, name);
    for (const [key, value] of Object.entries(attrs))element.setAttribute(key, value);
    return element;
};
const written = new WeakMap();
const attr = (element, name, value)=>{
    let values = written.get(element);
    if (!values) written.set(element, values = {});
    if (values[name] === value) return;
    values[name] = value;
    element.setAttribute(name, value);
};
const DEG = Math.PI / 180;
const transform = (data, ctx)=>{
    const anchor = vector(data.a, [
        0,
        0,
        0
    ], ctx);
    const separated = data.p?.s;
    const position = separated ? undefined : vector(data.p, [
        0,
        0,
        0
    ], ctx);
    const x = separated ? scalar(data.p?.x, 0, ctx) : undefined;
    const y = separated ? scalar(data.p?.y, 0, ctx) : undefined;
    const size = vector(data.s, [
        100,
        100,
        100
    ], ctx);
    const rotation = scalar(data.r, 0, ctx);
    const skew = data.sk ? scalar(data.sk, 0, ctx) : undefined;
    const skewAxis = scalar(data.sa, 0, ctx);
    const opacity = scalar(data.o, 100, ctx);
    return {
        matrix: (frame)=>{
            const [ax, ay] = anchor.at(frame);
            const [sx, sy] = size.at(frame);
            let m = scale(translate(identity(), -ax, -ay), sx / 100, sy / 100);
            if (skew) m = skewFromAxis(m, -skew.at(frame) * DEG, skewAxis.at(frame) * DEG);
            m = rotate(m, rotation.at(frame) * DEG);
            const [px, py] = position ? position.at(frame) : [
                x.at(frame),
                y.at(frame)
            ];
            return translate(m, px, py);
        },
        opacity: (frame)=>opacity.at(frame) / 100
    };
};
const LINE_CAPS = [
    '',
    'butt',
    'round',
    'square'
];
const LINE_JOINS = [
    '',
    'miter',
    'round',
    'bevel'
];
const rgb = ([r, g, b])=>`rgb(${Math.floor(r * 255)},${Math.floor(g * 255)},${Math.floor(b * 255)})`;
const createStyle = (item, level, ctx)=>{
    const element = create('path');
    const color = vector(item.c, [
        0,
        0,
        0,
        1
    ], ctx);
    const opacity = scalar(item.o, 100, ctx);
    const stroke = item.ty === 'st';
    const width = stroke ? scalar(item.w, 0, ctx) : undefined;
    if (stroke) {
        attr(element, 'stroke-linecap', LINE_CAPS[item.lc ?? 2]);
        attr(element, 'stroke-linejoin', LINE_JOINS[item.lj ?? 2]);
        attr(element, 'fill-opacity', '0');
        if (item.lj === 1) attr(element, 'stroke-miterlimit', String(item.ml ?? 4));
    } else if (item.r === 2) {
        attr(element, 'fill-rule', 'evenodd');
    }
    const kind = stroke ? 'stroke' : 'fill';
    return {
        element,
        level,
        closed: false,
        d: '',
        render: (frame)=>{
            attr(element, kind, rgb(color.at(frame)));
            attr(element, `${kind}-opacity`, String(opacity.at(frame) / 100));
            if (width) attr(element, 'stroke-width', String(width.at(frame)));
        }
    };
};
const geometry = (item, ctx)=>{
    if (item.ty === 'sh' && item.ks) return path(item.ks);
    const position = vector(item.p, [
        0,
        0
    ], ctx);
    const size = vector(item.s, [
        0,
        0
    ], ctx);
    const reversed = item.d === 3;
    if (item.ty === 'el') {
        return {
            animated: position.animated || size.animated,
            at: (frame)=>ellipse(position.at(frame), size.at(frame), reversed)
        };
    }
    if (item.ty === 'rc') {
        const roundness = scalar(item.r, 0, ctx);
        return {
            animated: position.animated || size.animated || roundness.animated,
            at: (frame)=>rectangle(position.at(frame), size.at(frame), roundness.at(frame), reversed)
        };
    }
    return undefined;
};
const buildShapes = (items, root, ctx)=>{
    const styles = [];
    const groups = [];
    const shapes = [];
    const trims = [];
    const search = (list, container, level, parents)=>{
        const own = [
            ...parents
        ];
        const ownStyles = [];
        const ownTrims = [];
        for(let i = list.length - 1; i >= 0; i -= 1){
            const item = list[i];
            if (item.hd) continue;
            if (item.ty === 'st' || item.ty === 'fl') {
                const style = createStyle(item, level, ctx);
                container.appendChild(style.element);
                styles.push(style);
                ownStyles.push(style);
            } else if (item.ty === 'gr') {
                const element = create('g');
                search(item.it ?? [], element, level + 1, own);
                container.appendChild(element);
            } else if (item.ty === 'tr') {
                const group = {
                    element: container,
                    transform: transform(item, ctx),
                    matrix: identity()
                };
                groups.push(group);
                own.push(group);
            } else if (item.ty === 'tm') {
                if (item.m === 2) ctx.warn('trim paths "individually" is drawn as "simultaneously"');
                const t = {
                    start: scalar(item.s, 0, ctx),
                    end: scalar(item.e, 100, ctx),
                    offset: scalar(item.o, 0, ctx),
                    closed: false
                };
                trims.push(t);
                ownTrims.push(t);
            } else if (item.ty === 'mm') {} else {
                const shape = geometry(item, ctx);
                if (!shape) {
                    ctx.warn(`unsupported shape "${item.ty}" ignored`);
                    continue;
                }
                shapes.push({
                    geometry: shape,
                    level,
                    groups: [
                        ...own
                    ],
                    styles: styles.filter((style)=>!style.closed),
                    trims: trims.filter((t)=>!t.closed)
                });
            }
        }
        for (const style of ownStyles)style.closed = true;
        for (const t of ownTrims)t.closed = true;
    };
    search(items, root, 0, []);
    return (frame)=>{
        for (const group of groups){
            group.matrix = group.transform.matrix(frame);
            attr(group.element, 'transform', toCss(group.matrix));
            attr(group.element, 'opacity', String(group.transform.opacity(frame)));
        }
        for (const style of styles)style.d = '';
        for (const shape of shapes){
            let paths = [
                shape.geometry.at(frame)
            ];
            for(let k = shape.trims.length - 1; k >= 0; k -= 1){
                const t = shape.trims[k];
                paths = trim(paths, t.start.at(frame) / 100, t.end.at(frame) / 100, t.offset.at(frame));
            }
            for (const style of shape.styles){
                let m = identity();
                for(let k = shape.groups.length - 1, n = shape.level - style.level; n > 0; k -= 1, n -= 1){
                    m = multiply(m, shape.groups[k].matrix);
                }
                for (const p of paths)style.d += pathString(p, m);
            }
        }
        for (const style of styles){
            attr(style.element, 'd', style.d || 'M0 0');
            style.render(frame);
        }
    };
};
const buildMasks = (masks, target, ctx)=>{
    let type = 'clipPath';
    let current = [];
    const views = [];
    const solid = `M0,0 h${ctx.width} v${ctx.height} h-${ctx.width} v-${ctx.height} `;
    for (const mask of masks){
        const opacity = scalar(mask.o, 100, ctx);
        if (mask.mode !== 'a' && mask.mode !== 'n' || mask.inv || opacity.animated || opacity.at(0) !== 100) {
            type = 'mask';
        }
        if (mask.mode === 'n') continue;
        let rect;
        if ((mask.mode === 's' || mask.mode === 'i') && !views.length) {
            rect = create('rect', {
                fill: '#ffffff',
                width: String(ctx.width),
                height: String(ctx.height)
            });
            current.push(rect);
        }
        const element = create('path', {
            fill: mask.mode === 's' ? '#000000' : '#ffffff',
            'clip-rule': 'nonzero'
        });
        if (mask.mode === 'i') {
            const group = create('g');
            for (const child of current)group.appendChild(child);
            const id = newId();
            const intersect = create('mask', {
                id,
                'mask-type': 'alpha'
            });
            intersect.appendChild(element);
            ctx.defs.appendChild(intersect);
            group.setAttribute('mask', `url(#${id})`);
            current = [
                group
            ];
        } else {
            current.push(element);
        }
        views.push({
            element,
            shape: path(mask.pt),
            opacity,
            inverted: Boolean(mask.inv),
            rect
        });
    }
    if (!views.length) return undefined;
    const id = newId();
    const container = create(type, {
        id
    });
    for (const child of current)container.appendChild(child);
    ctx.defs.appendChild(container);
    target.setAttribute(type === 'clipPath' ? 'clip-path' : 'mask', `url(#${id})`);
    return (frame, layerMatrix)=>{
        for (const view of views){
            const shape = view.shape.at(frame);
            const d = pathString(shape, identity()).replace(/z$/, '');
            attr(view.element, 'd', shape.c ? view.inverted ? solid + d : d : '');
            attr(view.element, 'fill-opacity', String(view.opacity.at(frame) / 100));
            if (view.rect) attr(view.rect, 'transform', toCss(invert(layerMatrix)));
        }
    };
};
const buildComposition = (layers, container, ctx)=>{
    const nodes = layers.map((data)=>{
        const node = {
            data,
            transform: transform(data.ks, ctx),
            matrix: identity()
        };
        if (data.ty === 3) return node;
        const element = create('g');
        let inner = element;
        if (data.ty === 0 && data.w && data.h) {
            const id = newId();
            const clip = create('clipPath', {
                id
            });
            clip.appendChild(create('path', {
                d: `M0,0 L${data.w},0 L${data.w},${data.h} L0,${data.h}z`
            }));
            ctx.defs.appendChild(clip);
            element.setAttribute('clip-path', `url(#${id})`);
            if (data.masksProperties?.length) {
                inner = create('g');
                element.appendChild(inner);
            }
        }
        let content;
        if (data.ty === 4) {
            content = buildShapes(data.shapes ?? [], inner, ctx);
        } else if (data.ty === 0 && data.refId && ctx.assets.has(data.refId)) {
            const render = buildComposition(ctx.assets.get(data.refId), inner, ctx);
            const remap = data.tm ? scalar(data.tm, 0, ctx) : undefined;
            content = (frame)=>{
                let local = remap ? remap.at(frame) * ctx.frameRate : (frame - (data.st ?? 0)) / (data.sr ?? 1);
                if (remap && local === data.op) local = data.op - 1;
                render(local);
            };
        } else {
            ctx.warn(`unsupported layer type ${data.ty} ignored`);
        }
        const masks = data.masksProperties?.length ? buildMasks(data.masksProperties, inner, ctx) : undefined;
        return {
            ...node,
            element,
            content,
            masks
        };
    });
    const byIndex = new Map(nodes.map((node)=>[
            node.data.ind,
            node
        ]));
    for(let i = nodes.length - 1; i >= 0; i -= 1){
        const element = nodes[i].element;
        if (element) container.appendChild(element);
    }
    return (frame)=>{
        for (const node of nodes)node.matrix = node.transform.matrix(frame);
        for (const node of nodes){
            const { data, element } = node;
            if (!element) continue;
            const visible = !data.hd && data.ip <= frame && frame < data.op;
            attr(element, 'display', visible ? 'inline' : 'none');
            if (!visible) continue;
            let m = node.matrix;
            for(let parent = byIndex.get(data.parent); parent; parent = byIndex.get(parent.data.parent)){
                m = multiply(m, parent.matrix);
            }
            attr(element, 'transform', toCss(m));
            attr(element, 'opacity', String(node.transform.opacity(frame)));
            node.masks?.(frame, m);
            node.content?.(frame);
        }
    };
};
const createRenderer = (data, ctx)=>{
    const svg = create('svg', {
        viewBox: `0 0 ${data.w} ${data.h}`,
        width: '100%',
        height: '100%',
        preserveAspectRatio: 'xMidYMid meet'
    });
    svg.style.display = 'block';
    const defs = create('defs');
    const clipId = newId();
    const clip = create('clipPath', {
        id: clipId
    });
    clip.appendChild(create('rect', {
        width: String(data.w),
        height: String(data.h),
        x: '0',
        y: '0'
    }));
    defs.appendChild(clip);
    const root = create('g', {
        'clip-path': `url(#${clipId})`
    });
    svg.append(defs, root);
    const assets = new Map((data.assets ?? []).filter((asset)=>asset.layers).map((asset)=>[
            asset.id,
            asset.layers
        ]));
    const render = buildComposition(data.layers, root, {
        ...ctx,
        defs,
        width: data.w,
        height: data.h,
        assets
    });
    return {
        svg,
        render
    };
};

// ── index.ts

const playing = new Set();
let frameRequest = 0;
let lastTime;
const schedule = ()=>{
    if (frameRequest || !playing.size || typeof requestAnimationFrame !== 'function') return;
    frameRequest = requestAnimationFrame(tick);
};
const tick = (now)=>{
    frameRequest = 0;
    const elapsed = lastTime === undefined ? 0 : Math.max(0, now - lastTime);
    lastTime = now;
    for (const player of Array.from(playing)){
        try {
            player.advance(elapsed);
        } catch (error) {
            player.fail(error);
        }
    }
    if (playing.size) schedule();
    else lastTime = undefined;
};
const warned = new WeakMap();
const warner = (data)=>(message)=>{
        let messages = warned.get(data);
        if (!messages) warned.set(data, messages = new Set());
        if (messages.has(message)) return;
        messages.add(message);
        console.warn(`react-useanimations: ${message}`);
    };
class Player {
    totalFrames;
    isPaused = true;
    frame = 0;
    firstFrame;
    frameRate;
    loop;
    direction = 1;
    speed = 1;
    playCount = 0;
    completedLoop = false;
    failed = false;
    renderer;
    listeners = {};
    constructor({ container, animationData, loop = false, autoplay = false }){
        const data = animationData;
        if (!data || !Array.isArray(data.layers)) {
            throw new Error('react-useanimations: `animationData` is not a Lottie animation.');
        }
        this.renderer = createRenderer(data, {
            frameRate: data.fr,
            warn: warner(data)
        });
        container.appendChild(this.renderer.svg);
        this.frameRate = data.fr;
        this.firstFrame = data.ip;
        this.totalFrames = data.op - data.ip;
        this.loop = loop;
        this.setFrame(0);
        if (autoplay) this.play();
    }
    play() {
        if (!this.isPaused || this.failed) return;
        this.isPaused = false;
        playing.add(this);
        schedule();
    }
    pause() {
        this.isPaused = true;
        playing.delete(this);
    }
    goToAndStop(frame) {
        this.setFrame(frame);
        this.pause();
    }
    setDirection(direction) {
        this.direction = direction < 0 ? -1 : 1;
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    playSegments([from, to]) {
        this.playCount = 0;
        if (to < from) {
            this.direction = -1;
            this.firstFrame = to;
            this.totalFrames = from - to;
            this.setFrame(this.totalFrames - 0.001);
        } else {
            this.direction = 1;
            this.firstFrame = from;
            this.totalFrames = to - from;
            this.setFrame(0.001);
        }
        this.play();
    }
    addEventListener(name, callback) {
        (this.listeners[name] ??= new Set()).add(callback);
        return ()=>{
            this.listeners[name].delete(callback);
        };
    }
    destroy() {
        this.pause();
        this.renderer.svg.remove();
        for (const name of Object.keys(this.listeners))this.listeners[name].clear();
    }
    fail(error) {
        this.pause();
        if (this.failed) return;
        this.failed = true;
        console.error('react-useanimations: an animation stopped after an error.', error);
    }
    advance(elapsed) {
        if (this.isPaused || elapsed <= 0) return;
        const modifier = this.frameRate / 1000 * this.speed * this.direction;
        let next = this.frame + elapsed * modifier;
        if (next >= this.totalFrames - 1 && modifier > 0) {
            if (this.loop && this.playCount !== this.loop) {
                if (next >= this.totalFrames) {
                    this.playCount += 1;
                    this.setFrame(next % this.totalFrames);
                    this.completedLoop = true;
                    this.trigger('loopComplete');
                } else {
                    this.setFrame(next);
                }
                return;
            }
            next = this.totalFrames - 1;
        } else if (next < 0) {
            if (this.loop && !(this.playCount-- <= 0 && this.loop !== true)) {
                this.setFrame(this.totalFrames + next % this.totalFrames);
                if (this.completedLoop) this.trigger('loopComplete');
                else this.completedLoop = true;
                return;
            }
            next = 0;
        } else {
            this.setFrame(next);
            return;
        }
        this.setFrame(next);
        this.pause();
        this.trigger('complete');
    }
    setFrame(frame) {
        this.frame = frame;
        if (this.failed) return;
        try {
            this.renderer.render(this.firstFrame + frame);
        } catch (error) {
            this.fail(error);
        }
    }
    trigger(name) {
        for (const callback of Array.from(this.listeners[name] ?? []))callback();
    }
}
const loadAnimation = (options)=>new Player(options);

export { loadAnimation };
