/* 호흡 훈련: 들이쉬기 5초 · 멈춤 1초 · 내쉬기 8초 · 멈춤 1초 (3D 풍선, WebGL) */
(function () {
'use strict';
// 홈페이지 언어 전환(site.js)이 <html lang> 을 바꾸면 안내 문구도 따라 바뀐다
const T = (ko, en) => (document.documentElement.lang === 'en' ? en : ko);

// --- 2. 호흡 운동 로직 (리듬 유지: 들이쉬기 5초 · 멈춤 1초 · 내쉬기 8초 · 멈춤 1초) ---
const canvas = document.getElementById('breathingCanvas');   // 2D: 눈금 · 풍선 끈
const ctx = canvas.getContext('2d');
const orbCanvas = document.getElementById('orbCanvas');      // WebGL: 3D 풍선 · 3D 궤도
const instructionText = document.getElementById('instructionText');
const countdownText = document.getElementById('countdownText');
const timerDisplay = document.getElementById('timerDisplay');
const timerDigits = document.getElementById('timerDigits');
const timerArc = document.getElementById('timerArc');
const timerBead = document.getElementById('timerBead');
const timerGradA = document.getElementById('timerGradA');
const timerGradB = document.getElementById('timerGradB');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let isBreathing = false;
let startTime = 0;
let currentPhaseStartTime = 0;
let lastTimestamp = 0;
let phase = 'inhale';

const INHALE_DURATION = 5000;
const HOLD_DURATION = 1000;
const EXHALE_DURATION = 8000;
const ROTATION_DURATION = 60000;

// 크기 (무대 반지름 대비 비율) — 가장 크게 부풀면 궤도 원에 닿음
const ORBIT_RATIO = 0.9;
const RING_WIDTH = 0.022;
const MAX_RATIO = 0.77;
const MIN_RATIO = 0.3;
const BALLOON_STRETCH = 1.08;

let size, centerX, centerY, orbitRadius;

// 풍선 방향 토글 (기본: 들이쉬면 작아지기) — 선택은 이 브라우저에만 저장
const DIRECTION_KEY = 'breath-direction';
const directionButtons = document.querySelectorAll('.direction-toggle button');
let inhaleShrinks = true;
try { inhaleShrinks = localStorage.getItem(DIRECTION_KEY) !== 'grow'; } catch (e) {}
function applyDirection() {
    directionButtons.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.direction === 'shrink') === inhaleShrinks)));
}
directionButtons.forEach(b => b.addEventListener('click', () => {
    inhaleShrinks = b.dataset.direction === 'shrink';
    try { localStorage.setItem(DIRECTION_KEY, inhaleShrinks ? 'shrink' : 'grow'); } catch (e) {}
    applyDirection();
}));
applyDirection();

// 단계별 풍선 색 (밝은 a, 깊은 b, 비쳐 보이는 c) — 들이쉬기 파랑 · 멈춤 보라 · 내쉬기 주황
const palette = {
    inhale: { a: [0.66, 0.90, 1.00], b: [0.28, 0.62, 1.00], c: [0.55, 0.98, 0.96] },
    hold:   { a: [0.86, 0.80, 1.00], b: [0.52, 0.40, 0.96], c: [1.00, 0.76, 0.95] },
    exhale: { a: [1.00, 0.76, 0.58], b: [1.00, 0.44, 0.32], c: [1.00, 0.72, 0.80] }
};
const trailColors = {
    inhale: [0.36, 0.63, 1.00],
    hold: [0.66, 0.55, 1.00],
    exhale: [1.00, 0.58, 0.42]
};
const live = {
    a: palette.inhale.a.slice(), b: palette.inhale.b.slice(), c: palette.inhale.c.slice(),
    head: trailColors.inhale.slice()
};

const TRAIL_SLOTS = 720;
let trailData = new Array(TRAIL_SLOTS).fill(null);
const trailPixels = new Uint8Array(TRAIL_SLOTS * 4);
let lastTrailIdx = -1;
let lastFillIdx = -1;

const css = (c, a = 1) => `rgba(${(c[0] * 255) | 0}, ${(c[1] * 255) | 0}, ${(c[2] * 255) | 0}, ${a})`;
const easeInOut = t => -(Math.cos(Math.PI * t) - 1) / 2;
const approach = (cur, tgt, k) => { for (let i = 0; i < 3; i++) cur[i] += (tgt[i] - cur[i]) * k; };

// ---------- WebGL ----------
const VERT = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;
const FRAG = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform float uR;
    uniform float uBreath;
    uniform float uWobble;
    uniform vec3 uColA;
    uniform vec3 uColB;
    uniform vec3 uColC;
    uniform vec3 uHeadCol;
    uniform float uHead;
    uniform float uOrbitR;
    uniform float uRingW;
    uniform float uStretch;
    uniform sampler2D uTrail;

    const float PI = 3.14159265;
    const vec3 L = vec3(-0.49207, 0.63968, 0.59048);

    float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
    }

    // 풍선: 위는 둥글고 아래로 갈수록 좁아지며 끝에 매듭
    float map(vec3 p) {
        float cy = uR * 0.05;
        p.y -= cy;
        float yn = p.y / uR;
        float taper = 1.0 - 0.2 * smoothstep(0.1, -1.1, yn) + 0.04 * smoothstep(0.0, 0.9, yn);
        float t = uTime;
        float w = uWobble * (sin(p.x / uR * 3.0 + t * 0.9) * sin(p.y / uR * 2.6 - t * 0.7) + 0.5 * sin(p.z / uR * 3.4 + t * 0.6));
        vec3 q = vec3(p.x / taper, p.y / uStretch, p.z / taper);
        float d = (length(q) - uR * (1.0 + w)) * taper * 0.9;
        vec3 k = p - vec3(0.0, -uStretch * uR - 0.012, 0.0);
        float knot = length(k * vec3(1.0, 1.35, 1.0)) - 0.03;
        return smin(d, knot, 0.025);
    }
    vec3 calcNormal(vec3 p) {
        const vec2 k = vec2(1.0, -1.0);
        float h = 0.0015;
        return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) +
                         k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h));
    }

    // 광택 있는 라텍스 풍선 재질
    vec3 shadeBalloon(vec3 p, vec3 rd) {
        vec3 n = calcNormal(p);
        vec3 v = -rd;
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float edge = 1.0 - ndv;

        // 가운데는 밝고 투명하게, 가장자리는 색이 짙게
        vec3 col = mix(uColA, uColB, smoothstep(0.05, 0.95, edge) * 0.75);
        col = mix(col, uColB * 0.85, smoothstep(0.3, -1.0, n.y) * 0.35);
        float diff = 0.78 + 0.22 * dot(n, L);
        col *= diff;
        // 빛이 풍선을 통과해 아래쪽이 은은하게 빛남
        col += uColC * 0.35 * smoothstep(0.1, -0.9, n.y) * smoothstep(0.1, 0.8, ndv);
        col = mix(col, vec3(1.0), pow(ndv, 5.0) * 0.18);

        vec3 r = reflect(rd, n);
        // 창문 모양의 큰 반사
        vec2 hw = (r.xy - vec2(-0.40, 0.48)) * vec2(1.0, 1.25);
        float win = smoothstep(0.30, 0.10, length(hw));
        col += win * 0.55;
        // 날카로운 하이라이트 + 부드러운 광택
        float rl = max(dot(r, L), 0.0);
        col += pow(rl, 140.0) * 1.1 + pow(rl, 10.0) * 0.14;
        // 오른쪽 아래 반사광
        float rim = pow(edge, 2.5) * smoothstep(-0.2, 0.6, n.x - n.y);
        col += rim * 0.35 * mix(uColC, vec3(1.0), 0.4);
        return clamp(col, 0.0, 1.0);
    }

    vec4 over(vec4 top, vec4 bottom) { return top + bottom * (1.0 - top.a); }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
        float px = 2.0 / uRes.y;
        vec3 ro = vec3(uv, 3.0);
        vec3 rd = vec3(0.0, 0.0, -1.0);
        float d = length(uv);

        // 풍선 주변 은은한 빛
        float dc = length((uv - vec2(0.0, uR * 0.02)) / vec2(1.0, uStretch)) - uR;
        float halo = exp(-max(dc, 0.0) * 6.0) * (0.18 + 0.10 * uBreath) * (1.0 - smoothstep(0.8, 0.99, d));
        vec4 col = vec4(mix(uColA, vec3(1.0), 0.2) * halo, halo);

        // 풍선 (레이마칭)
        float bound = uR * (uStretch + 0.12) + 0.06;
        vec2 bc = uv - vec2(0.0, uR * 0.05);
        float rr = dot(bc, bc);
        if (rr < bound * bound) {
            float t = 3.0 - sqrt(bound * bound - rr);
            float minD = 1e5, tMin = t;
            bool hit = false;
            for (int i = 0; i < 40; i++) {
                float dd = map(ro + rd * t);
                if (dd < minD) { minD = dd; tMin = t; }
                if (dd < 0.0004) { hit = true; break; }
                t += dd * 0.75;
                if (t > 3.0 + bound) break;
            }
            float cover = hit ? 1.0 : 1.0 - smoothstep(0.0, px * 1.5, minD);
            if (cover > 0.0) {
                vec3 bcol = shadeBalloon(ro + rd * tMin, rd);
                col = over(vec4(bcol * cover, cover), col);
            }
        }

        // 파스텔 리본 같은 궤도 (칸 없이 매끈하게, 은은한 입체감)
        float x = (d - uOrbitR) / uRingW;
        float ax = abs(x);
        if (ax < 5.0) {
            vec2 dir = uv / max(d, 1e-4);
            float prog = fract(atan(uv.x, uv.y) / (2.0 * PI));
            vec4 tr = texture2D(uTrail, vec2(prog, 0.5));
            // 지나온 길 주변의 부드러운 빛
            float glow = tr.a * exp(-ax * ax * 0.18) * 0.22;
            col = over(vec4(tr.rgb * glow, glow), col);
            if (ax < 1.3) {
                float cx = clamp(x, -1.0, 1.0);
                vec3 n = normalize(vec3(dir * cx * 0.8, sqrt(max(1.0 - cx * cx, 0.0)) + 0.2));
                float diff = 0.9 + 0.1 * dot(n, L);
                float sheen = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 18.0) * 0.35;
                vec3 base = mix(vec3(0.91, 0.94, 1.0), tr.rgb, tr.a);
                vec3 rc = min(base * diff + sheen, vec3(1.0));
                float ra = mix(0.7, 1.0, tr.a);
                float cov = 1.0 - smoothstep(1.0 - px / uRingW * 1.2, 1.0, ax);
                col = over(vec4(rc * ra * cov, ra * cov), col);
            }
        }

        // 진행 표시: 숨결처럼 은은하게 빛나는 작은 진주
        vec2 hp = uOrbitR * vec2(sin(2.0 * PI * uHead), cos(2.0 * PI * uHead));
        float bd = length(uv - hp);
        float br = uRingW * (1.9 + 0.25 * uBreath);
        float hg = exp(-(bd * bd) / (br * br * 7.0)) * (0.35 + 0.15 * uBreath);
        col = over(vec4(uHeadCol * hg, hg), col);
        if (bd < br + px * 2.0) {
            vec2 lp = (uv - hp) / br;
            float cl = clamp(dot(lp, lp), 0.0, 1.0);
            vec3 n = vec3(lp, sqrt(1.0 - cl));
            vec3 pc = mix(vec3(1.0), uHeadCol, 0.15 + 0.45 * pow(1.0 - n.z, 1.5));
            pc += pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 20.0) * 0.4;
            float cov = 1.0 - smoothstep(br - px * 1.2, br, bd);
            col = over(vec4(clamp(pc, 0.0, 1.0) * cov, cov), col);
        }

        gl_FragColor = col;
    }
`;

let gl = null, glU = {}, trailTex = null;

function initGL() {
    try {
        gl = orbCanvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    } catch (e) { gl = null; }
    if (!gl) return false;
    const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
        return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { gl = null; return false; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uRes', 'uTime', 'uR', 'uBreath', 'uWobble', 'uColA', 'uColB', 'uColC', 'uHeadCol', 'uHead',
     'uOrbitR', 'uRingW', 'uStretch', 'uTrail'].forEach(n => { glU[n] = gl.getUniformLocation(prog, n); });

    // 지나온 호흡 색을 담는 1차원 텍스처 (선형 보간으로 색이 자연스럽게 섞임)
    trailTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, trailTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TRAIL_SLOTS, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, trailPixels);
    gl.uniform1i(glU.uTrail, 0);
    return true;
}

// 궤적 색을 앞뒤로 번지게 해 단계 사이가 그라데이션으로 이어지도록 함
function uploadTrail(currentIdx) {
    const BLUR = 40;
    for (let i = 0; i < TRAIL_SLOTS; i++) {
        const o = i * 4;
        if (!trailData[i]) { trailPixels[o + 3] = 0; continue; }
        let r = 0, g = 0, b = 0, w = 0;
        for (let k = -BLUR; k <= BLUR; k++) {
            const key = trailData[(i + k + TRAIL_SLOTS) % TRAIL_SLOTS];
            if (!key) continue;
            const c = trailColors[key];
            const wk = 1 - Math.abs(k) / (BLUR + 1);
            r += c[0] * wk; g += c[1] * wk; b += c[2] * wk; w += wk;
        }
        const age = ((currentIdx - i + TRAIL_SLOTS) % TRAIL_SLOTS) / TRAIL_SLOTS;
        const a = 0.6 + 0.4 * (1 - age);
        // 텍스처는 곱해진 알파가 아닌 원래 색으로 저장
        trailPixels[o] = (r / w) * 255;
        trailPixels[o + 1] = (g / w) * 255;
        trailPixels[o + 2] = (b / w) * 255;
        trailPixels[o + 3] = a * 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, trailTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TRAIL_SLOTS, 1, gl.RGBA, gl.UNSIGNED_BYTE, trailPixels);
}

function drawGL(ratio, breathLevel, headProgress, time) {
    gl.viewport(0, 0, orbCanvas.width, orbCanvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(glU.uRes, orbCanvas.width, orbCanvas.height);
    gl.uniform1f(glU.uTime, time / 1000);
    gl.uniform1f(glU.uR, ratio);
    gl.uniform1f(glU.uBreath, breathLevel);
    gl.uniform1f(glU.uWobble, reduceMotion ? 0.0 : 0.012);
    gl.uniform3fv(glU.uColA, live.a);
    gl.uniform3fv(glU.uColB, live.b);
    gl.uniform3fv(glU.uColC, live.c);
    gl.uniform3fv(glU.uHeadCol, live.head);
    gl.uniform1f(glU.uHead, headProgress);
    gl.uniform1f(glU.uOrbitR, ORBIT_RATIO);
    gl.uniform1f(glU.uRingW, RING_WIDTH);
    gl.uniform1f(glU.uStretch, BALLOON_STRETCH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, trailTex);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// WebGL 을 쓸 수 없는 기기용 대체 그림
function drawFallback(ratio, headProgress) {
    const r = ratio * size / 2;
    const cy = centerY - r * 0.05;
    const g = ctx.createRadialGradient(centerX - r * 0.35, cy - r * 0.45, r * 0.1, centerX, cy, r * 1.1);
    g.addColorStop(0, css(live.a));
    g.addColorStop(1, css(live.b));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(centerX, cy, r, r * BALLOON_STRETCH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(13, 71, 161, 0.12)';
    ctx.lineWidth = 8;
    ctx.stroke();
    const a = Math.PI * 2 * headProgress - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(centerX + Math.cos(a) * orbitRadius, centerY + Math.sin(a) * orbitRadius, 8, 0, Math.PI * 2);
    ctx.fillStyle = css(live.head);
    ctx.fill();
}

function initializeCanvas() {
    const parent = canvas.parentElement;
    size = Math.min(parent.offsetWidth, parent.offsetHeight);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 셰이더는 픽셀 수에 비례해 무거우므로 해상도를 최대 2배로 제한
    const glScale = Math.min(dpr, 2);
    orbCanvas.width = Math.round(size * glScale);
    orbCanvas.height = Math.round(size * glScale);
    orbCanvas.style.width = `${size}px`;
    orbCanvas.style.height = `${size}px`;
    centerX = size / 2;
    centerY = size / 2;
    orbitRadius = (size / 2) * ORBIT_RATIO;
}

// 풍선 끈 (WebGL 층 아래에 그림)
function draw2D(ratio, time) {
    ctx.clearRect(0, 0, size, size);
    const half = size / 2;
    // 매듭 아래로 흔들리는 끈
    const tipY = centerY + (BALLOON_STRETCH * ratio - ratio * 0.05) * half + 0.04 * half;
    const len = Math.max(0, size - tipY);
    if (len > 4) {
        const sway = reduceMotion ? 0 : Math.sin(time * 0.0012) * 6;
        const grad = ctx.createLinearGradient(0, tipY, 0, size);
        grad.addColorStop(0, css(live.b, 0.75));
        grad.addColorStop(1, css(live.b, 0));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, tipY);
        ctx.bezierCurveTo(centerX + 8 + sway, tipY + len * 0.35, centerX - 8 - sway, tipY + len * 0.65, centerX + sway * 0.5, size);
        ctx.stroke();
    }
}

// ---------- 연습 시간 (굴러가는 숫자 + 1분 진행 링) ----------
const digitCols = [];
(function buildDigits() {
    const mk = () => {
        const d = document.createElement('span');
        d.className = 'digit';
        const col = document.createElement('span');
        col.className = 'digit-col';
        for (let n = 0; n <= 9; n++) {
            const s = document.createElement('span');
            s.textContent = n;
            col.appendChild(s);
        }
        d.appendChild(col);
        timerDigits.appendChild(d);
        digitCols.push({ col, value: -1 });
    };
    mk(); mk();
    const colon = document.createElement('span');
    colon.className = 'digit-colon';
    colon.textContent = ':';
    timerDigits.appendChild(colon);
    mk(); mk();
})();
const ARC_LEN = 2 * Math.PI * 18;
timerArc.style.strokeDasharray = `${ARC_LEN}`;
let lastMinute = 0;

function setDigit(i, v) {
    const d = digitCols[i];
    if (d.value === v) return;
    d.value = v;
    d.col.style.transform = `translateY(${-v * 1.25}em)`;
}

function updateTimer(elapsedTotal) {
    const totalSeconds = Math.floor(elapsedTotal / 1000);
    const minutes = Math.min(99, Math.floor(totalSeconds / 60));
    const seconds = totalSeconds % 60;
    setDigit(0, Math.floor(minutes / 10));
    setDigit(1, minutes % 10);
    setDigit(2, Math.floor(seconds / 10));
    setDigit(3, seconds % 10);
    timerDisplay.setAttribute('aria-label', T(`연습 시간 ${minutes}분 ${seconds}초`, `Practice time ${minutes} min ${seconds} s`));

    const p = (elapsedTotal % ROTATION_DURATION) / ROTATION_DURATION;
    timerArc.style.strokeDashoffset = `${ARC_LEN * (1 - p)}`;
    const a = 2 * Math.PI * p;
    timerBead.setAttribute('cx', (22 + 18 * Math.sin(a)).toFixed(2));
    timerBead.setAttribute('cy', (22 - 18 * Math.cos(a)).toFixed(2));
    timerBead.style.stroke = css(live.head);
    timerGradA.setAttribute('stop-color', css(live.a));
    timerGradB.setAttribute('stop-color', css(live.head));

    // 1분마다 살짝 튀어오르며 반짝임
    if (minutes > lastMinute) {
        lastMinute = minutes;
        timerDisplay.classList.add('minute-pulse');
        setTimeout(() => timerDisplay.classList.remove('minute-pulse'), 900);
    }
}

function setInstruction(text) {
    if (instructionText.textContent !== text) instructionText.textContent = text;
    instructionText.style.opacity = text ? 1 : 0;
    const deep = [live.b[0] * 0.45, live.b[1] * 0.45, live.b[2] * 0.45];
    instructionText.style.textShadow = `0 2px 14px ${css(deep, 0.5)}`;
}

function animate(timestamp) {
    if (!startTime) startTime = currentPhaseStartTime = lastTimestamp = timestamp;
    const rawDt = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    let elapsedTotal = timestamp - startTime;
    let elapsedPhase = timestamp - currentPhaseStartTime;

    let ratio;
    let phaseType = phase.startsWith('hold') ? 'hold' : phase;

    if (phase === 'inhale') {
        const t = Math.min(1, elapsedPhase / INHALE_DURATION);
        ratio = MIN_RATIO + (MAX_RATIO - MIN_RATIO) * easeInOut(t);
        setInstruction(T('들이쉬기', 'Breathe in'));
        countdownText.textContent = Math.ceil((INHALE_DURATION - elapsedPhase) / 1000);
    } else if (phase === 'hold1') {
        ratio = MAX_RATIO;
        setInstruction('');
        countdownText.textContent = '';
    } else if (phase === 'exhale') {
        const t = Math.min(1, elapsedPhase / EXHALE_DURATION);
        ratio = MAX_RATIO - (MAX_RATIO - MIN_RATIO) * easeInOut(t);
        setInstruction(T('내쉬기', 'Breathe out'));
        countdownText.textContent = Math.ceil((EXHALE_DURATION - elapsedPhase) / 1000);
    } else if (phase === 'hold2') {
        ratio = MIN_RATIO;
        setInstruction('');
        countdownText.textContent = '';
    }

    // 토글: '들이쉬면 작아지기'면 크기 방향을 뒤집음
    if (inhaleShrinks) ratio = MIN_RATIO + MAX_RATIO - ratio;

    // 색 보간 (약 0.6초에 걸쳐 전환)
    const k = 1 - Math.pow(0.004, Math.min(1000, rawDt) / 1000);
    approach(live.a, palette[phaseType].a, k);
    approach(live.b, palette[phaseType].b, k);
    approach(live.c, palette[phaseType].c, k);
    approach(live.head, trailColors[phaseType], k);

    updateTimer(elapsedTotal);

    const breathLevel = (ratio - MIN_RATIO) / (MAX_RATIO - MIN_RATIO);
    const headProgress = (elapsedTotal % ROTATION_DURATION) / ROTATION_DURATION;
    const currentIdx = Math.floor(headProgress * TRAIL_SLOTS);
    // 프레임이 늦어도 궤적에 빈칸이 생기지 않도록 사이 칸까지 채움
    if (lastFillIdx < 0) trailData[currentIdx] = phaseType;
    else for (let i = lastFillIdx; i !== currentIdx; i = (i + 1) % TRAIL_SLOTS) trailData[(i + 1) % TRAIL_SLOTS] = phaseType;
    lastFillIdx = currentIdx;

    draw2D(ratio, timestamp);
    if (gl) {
        if (currentIdx !== lastTrailIdx) { uploadTrail(currentIdx); lastTrailIdx = currentIdx; }
        drawGL(ratio, breathLevel, headProgress, timestamp);
    } else {
        drawFallback(ratio, headProgress);
    }

    if (phase === 'inhale' && elapsedPhase >= INHALE_DURATION) { phase = 'hold1'; currentPhaseStartTime = timestamp; }
    else if (phase === 'hold1' && elapsedPhase >= HOLD_DURATION) { phase = 'exhale'; currentPhaseStartTime = timestamp; }
    else if (phase === 'exhale' && elapsedPhase >= EXHALE_DURATION) { phase = 'hold2'; currentPhaseStartTime = timestamp; }
    else if (phase === 'hold2' && elapsedPhase >= HOLD_DURATION) { phase = 'inhale'; currentPhaseStartTime = timestamp; }

    if (isBreathing) requestAnimationFrame(animate);
}

window.onresize = initializeCanvas;
window.onload = () => { initGL(); initializeCanvas(); isBreathing = true; requestAnimationFrame(animate); };
})();
