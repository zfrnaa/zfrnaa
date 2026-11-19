import fs from "node:fs";
import path from "node:path";

const USERNAME = process.env.GITHUB_REPOSITORY_OWNER || "zfrnaa";
const TOKEN = process.env.GITHUB_TOKEN || "";
const OUT_DIR = path.resolve(process.cwd(), "dist");

fs.mkdirSync(OUT_DIR, { recursive: true });

const THEMES = {
  dark: {
    bg: "#0d1117",
    surface: "#0b0f15",
    surface2: "#11161f",
    border: "#21262d",
    text: "#f0f6fc",
    muted: "#8b949e",
    subtle: "#6e7681",
    accent: "#f59e0b",
    accentInk: "#0d1117",
    merged: "#a371f7",
    waveHi: "#f59e0b",
    waveMid: "#b45309",
    waveLow: "#21262d",
    waveOff: "#11161f",
  },
  light: {
    bg: "#ffffff",
    surface: "#f6f8fa",
    surface2: "#eef1f5",
    border: "#d0d7de",
    text: "#1f2328",
    muted: "#59636e",
    subtle: "#6e7781",
    accent: "#d97706",
    accentInk: "#ffffff",
    merged: "#8250df",
    waveHi: "#d97706",
    waveMid: "#f59e0b",
    waveLow: "#d0d7de",
    waveOff: "#eaeef2",
  },
};

const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
const FONT_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

function esc(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function ghFetch(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "zfrnaa-profile-generator",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  return res.json();
}

async function fetchStats() {
  const fallback = {
    publicRepos: 37,
    mergedPrs: 15,
    starsDeskPilot: 1,
    starsKursus: 7,
  };
  try {
    const [user, prs, rDesk, rKursus] = await Promise.all([
      ghFetch(`https://api.github.com/users/${USERNAME}`),
      ghFetch(
        `https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+is:merged`
      ),
      ghFetch(`https://api.github.com/repos/${USERNAME}/deskpilot-agent`),
      ghFetch(`https://api.github.com/repos/${USERNAME}/kursus-git-github`),
    ]);
    return {
      publicRepos: user?.public_repos ?? fallback.publicRepos,
      mergedPrs: prs?.total_count ?? fallback.mergedPrs,
      starsDeskPilot: rDesk?.stargazers_count ?? fallback.starsDeskPilot,
      starsKursus: rKursus?.stargazers_count ?? fallback.starsKursus,
    };
  } catch {
    return fallback;
  }
}

function buildKLSkyline(t) {
  const cols = 144;
  const rows = 15;
  const cellW = 6;
  const cellH = 6;
  const ox = 18;
  const oy = 31;

  // 4x4 Bayer matrix normalized 0..15 for crisp architectural dithering
  const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  // Return cell type: 0 = sky, 1 = building body, 2 = lit/accent spire or window
  function sampleSkyline(x, y) {
    // y = 0 is top, y = 14 is ground
    const fromBottom = rows - 1 - y;

    // 1. Merdeka 118 (cols 24..34)
    if (x === 29 && fromBottom <= 14) return fromBottom >= 12 ? 2 : 1;
    if (x >= 27 && x <= 31 && fromBottom <= 10) return (x === 29 && fromBottom % 2 === 0) ? 2 : 1;
    if (x >= 25 && x <= 33 && fromBottom <= 7) return 1;
    if (x >= 24 && x <= 34 && fromBottom <= 4) return 1;

    // 2. KL Tower / Menara KL (cols 51..57)
    if (x === 54 && fromBottom <= 13) return fromBottom >= 11 ? 2 : 1;
    if (x >= 52 && x <= 56 && fromBottom >= 7 && fromBottom <= 9) return fromBottom === 8 ? 2 : 1;
    if (x >= 53 && x <= 55 && fromBottom <= 6) return 1;

    // 3. Petronas Twin Towers + Skybridge (cols 75..97)
    // Left tower center = 80, Right tower center = 92
    for (const cx of [80, 92]) {
      const dx = Math.abs(x - cx);
      if (dx === 0 && fromBottom <= 14) return fromBottom >= 12 ? 2 : 1;
      if (dx <= 1 && fromBottom <= 11) return (fromBottom === 11) ? 2 : 1;
      if (dx <= 2 && fromBottom <= 9) return (dx === 0 && fromBottom % 3 === 0) ? 2 : 1;
      if (dx <= 3 && fromBottom <= 6) return 1;
    }
    // Iconic Skybridge connecting the two towers
    if (x >= 83 && x <= 89 && (fromBottom === 5 || fromBottom === 6)) {
      return fromBottom === 6 ? 2 : 1;
    }

    // 4. Exchange 106 / TRX (cols 114..122)
    if (x >= 116 && x <= 120 && fromBottom <= 11) return fromBottom >= 9 ? 2 : 1;
    if (x >= 115 && x <= 121 && fromBottom <= 8) return 1;

    // 5. Mid-rise KL urban skyline blocks
    const blocks = [
      [3, 9, 4], [11, 16, 6], [18, 22, 3], [37, 42, 5], [44, 48, 3],
      [60, 65, 5], [67, 72, 4], [100, 105, 5], [107, 111, 4],
      [125, 130, 5], [133, 139, 4], [141, 143, 2],
    ];
    for (const [x1, x2, h] of blocks) {
      if (x >= x1 && x <= x2 && fromBottom <= h) {
        return (fromBottom === h && (x + h) % 4 === 0) ? 2 : 1;
      }
    }

    // Ground line
    if (fromBottom === 0) return 1;
    return 0;
  }

  const rects = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const kind = sampleSkyline(x, y);
      const b = bayer[y % 4][x % 4];
      let fill = null;

      if (kind === 2) {
        fill = t.waveHi;
      } else if (kind === 1) {
        // Subtle dithered texture inside building silhouettes
        fill = (y > 4 && b < 4) ? t.waveMid : t.text;
        const opacity = fill === t.text ? (y < 6 ? "0.75" : "0.45") : "0.85";
        rects.push(
          `<rect x="${ox + x * cellW}" y="${oy + y * cellH}" width="4.5" height="4.5" fill="${fill}" opacity="${opacity}"/>`
        );
        continue;
      } else {
        // Atmospheric Bayer-dithered horizon glow behind skyline
        const glow = Math.max(0, (y - 5) / 10);
        if (glow * 14 > b) {
          fill = t.waveLow;
        }
      }

      if (fill) {
        rects.push(
          `<rect x="${ox + x * cellW}" y="${oy + y * cellH}" width="4.5" height="4.5" fill="${fill}"/>`
        );
      }
    }
  }
  return rects.join("");
}

function renderHero(t, stats) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="334" viewBox="0 0 900 334" role="img" aria-label="Rann (@zfrnaa) — Software AI Engineer and UI/UX Designer">
  <rect x="0.5" y="0.5" width="899" height="333" fill="${t.surface}" stroke="${t.border}"/>
  <!-- Top Wave Canvas -->
  <rect x="1" y="1" width="898" height="122" fill="${t.bg}"/>
  <line x1="1" y1="123" x2="899" y2="123" stroke="${t.border}"/>
  <text x="20" y="23" font-family="${FONT_MONO}" font-size="11" fill="${t.muted}" letter-spacing="0.5">zfrnaa <tspan fill="${t.accent}" font-weight="700">■ SHIPPING</tspan></text>
  ${buildKLSkyline(t)}

  <!-- Left Identity Column -->
  <line x1="530" y1="123" x2="530" y2="333" stroke="${t.border}"/>
  <text x="24" y="172" font-family="${FONT_SANS}" font-size="40" font-weight="700" fill="${t.text}" letter-spacing="-1.5">Rann</text>
  <text x="24" y="196" font-family="${FONT_SANS}" font-size="14.5" font-weight="600" fill="${t.text}">Software AI Engineer · UI/UX Designer</text>
  <text x="24" y="218" font-family="${FONT_SANS}" font-size="13" fill="${t.muted}">Designing autonomous agentic workflows, scalable backends,</text>
  <text x="24" y="236" font-family="${FONT_SANS}" font-size="13" fill="${t.muted}">and human-centered interfaces — Code and UI for love.</text>

  <line x1="24" y1="258" x2="506" y2="258" stroke="${t.border}"/>
  <text x="24" y="280" font-family="${FONT_MONO}" font-size="11" fill="${t.subtle}">MISSION</text>
  <text x="96" y="280" font-family="${FONT_MONO}" font-size="11.5" fill="${t.text}">Autonomous Financial Agents (AR &amp; AP Reconciliation)</text>
  <text x="24" y="302" font-family="${FONT_MONO}" font-size="11" fill="${t.subtle}">STATUS</text>
  <text x="96" y="302" font-family="${FONT_MONO}" font-size="11.5" fill="${t.text}">Open to Engineering &amp; Product Design collaborations</text>

  <!-- Right 2x2 Telemetry Grid -->
  <line x1="715" y1="123" x2="715" y2="333" stroke="${t.border}"/>
  <line x1="530" y1="228" x2="899" y2="228" stroke="${t.border}"/>

  <!-- Cell 1 -->
  <text x="550" y="148" font-family="${FONT_MONO}" font-size="10" fill="${t.subtle}" letter-spacing="0.8">REPOSITORIES</text>
  <text x="550" y="186" font-family="${FONT_SANS}" font-size="22" font-weight="700" fill="${t.text}">${esc(stats.publicRepos)}</text>
  <text x="550" y="206" font-family="${FONT_MONO}" font-size="10.5" fill="${t.muted}">public repos</text>

  <!-- Cell 2 -->
  <text x="735" y="148" font-family="${FONT_MONO}" font-size="10" fill="${t.subtle}" letter-spacing="0.8">OSS IMPACT</text>
  <text x="735" y="186" font-family="${FONT_SANS}" font-size="22" font-weight="700" fill="${t.text}">${esc(stats.mergedPrs)}+ PRs</text>
  <text x="735" y="206" font-family="${FONT_MONO}" font-size="10.5" fill="${t.muted}">merged across OSS</text>

  <!-- Cell 3 -->
  <text x="550" y="253" font-family="${FONT_MONO}" font-size="10" fill="${t.subtle}" letter-spacing="0.8">FOCUS</text>
  <text x="550" y="291" font-family="${FONT_SANS}" font-size="20" font-weight="700" fill="${t.text}">Agents · UI</text>
  <text x="550" y="311" font-family="${FONT_MONO}" font-size="10.5" fill="${t.muted}">LangGraph · WinUI</text>

  <!-- Cell 4 -->
  <text x="735" y="253" font-family="${FONT_MONO}" font-size="10" fill="${t.subtle}" letter-spacing="0.8">LOCATION</text>
  <text x="735" y="291" font-family="${FONT_SANS}" font-size="20" font-weight="700" fill="${t.text}">MYT +08</text>
  <text x="735" y="311" font-family="${FONT_MONO}" font-size="10.5" fill="${t.muted}">Kuala Lumpur</text>
</svg>`;
}

function renderWorkCard(t, item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="196" viewBox="0 0 440 196" role="img" aria-label="${esc(item.title)}">
  <rect x="0.5" y="0.5" width="439" height="195" fill="${t.surface}" stroke="${t.border}"/>
  <!-- Top Bar -->
  <line x1="1" y1="34" x2="439" y2="34" stroke="${t.border}"/>
  <text x="16" y="21" font-family="${FONT_MONO}" font-size="11" fill="${t.muted}">${esc(item.slug)}</text>
  <text x="424" y="21" text-anchor="end" font-family="${FONT_MONO}" font-size="11" font-weight="700" fill="${t.accent}">${esc(item.tag)}</text>

  <!-- Middle Body -->
  <rect x="1" y="35" width="438" height="117" fill="${t.surface2}"/>
  <text x="16" y="64" font-family="${FONT_SANS}" font-size="18" font-weight="700" fill="${t.text}" letter-spacing="-0.3">${esc(item.title)}</text>
  <text x="16" y="88" font-family="${FONT_SANS}" font-size="12.5" fill="${t.muted}">${esc(item.line1)}</text>
  <text x="16" y="107" font-family="${FONT_SANS}" font-size="12.5" fill="${t.muted}">${esc(item.line2)}</text>
  <text x="16" y="126" font-family="${FONT_SANS}" font-size="12.5" fill="${t.muted}">${esc(item.line3)}</text>

  <!-- Footer -->
  <line x1="1" y1="152" x2="439" y2="152" stroke="${t.border}"/>
  <text x="16" y="178" font-family="${FONT_MONO}" font-size="11" fill="${t.muted}">${esc(item.stack)}</text>
  <rect x="338" y="162" width="86" height="22" fill="${t.accent}"/>
  <text x="381" y="177" text-anchor="middle" font-family="${FONT_MONO}" font-size="10.5" font-weight="700" fill="${t.accentInk}">${esc(item.cta)}</text>
</svg>`;
}

const OSS_ITEMS = [
  {
    id: "look",
    repo: "kunkka19xx/look",
    pr: "feat(gpui): inline preview actions & Run as administrator (Ctrl+Shift+Enter)",
  },
  {
    id: "lookbook",
    repo: "kunkka19xx/lookbook",
    pr: "feat(timezone): add Windows support and clock mode to bin/timezone",
  },
  {
    id: "pasarmalam",
    repo: "muazhazali/caripasarmalam",
    pr: "PasarMalam.app — map UX, direction chooser & navigation for 1,000+ markets",
  },
  {
    id: "skills-icons",
    repo: "syvixor/skills-icons",
    pr: "docs: add Bahasa Melayu (Malay) translation for community documentation",
  },
];

function renderOssRow(t, r) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="46" viewBox="0 0 900 46" role="img" aria-label="${esc(r.repo)} — ${esc(r.pr)}">
  <rect x="0.5" y="0.5" width="899" height="45" fill="${t.surface}" stroke="${t.border}"/>
  <text x="18" y="27" font-family="${FONT_MONO}" font-size="12" font-weight="700" fill="${t.text}">${esc(r.repo)} <tspan fill="${t.accent}">↗</tspan></text>
  <text x="252" y="27" font-family="${FONT_SANS}" font-size="12.5" fill="${t.muted}">${esc(r.pr)}</text>
</svg>`;
}

function renderLinkTile(t, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="46" viewBox="0 0 300 46" role="img" aria-label="${esc(label)}">
  <rect x="0.5" y="0.5" width="299" height="45" fill="${t.surface}" stroke="${t.border}"/>
  <text x="150" y="27" text-anchor="middle" font-family="${FONT_MONO}" font-size="12.5" font-weight="700" fill="${t.text}">${esc(label)} <tspan fill="${t.accent}">↗</tspan></text>
</svg>`;
}

async function main() {
  const stats = await fetchStats();
  const workItems = [
    {
      id: "deskpilot",
      slug: "deskpilot-agent",
      tag: `AI AGENT · ★ ${stats.starsDeskPilot}`,
      title: "DeskPilot Agent",
      line1: "Autonomous desktop & workspace orchestrator for on-boot",
      line2: "diagnostics, schedule triage, and stateful multi-step",
      line3: "LangGraph workflows with trace observability.",
      stack: "Python · LangGraph · LangSmith",
      cta: "VIEW REPO",
    },
    {
      id: "5g",
      slug: "enterprise-5g",
      tag: "PREVIOUS WORK",
      title: "Enterprise 5G Visualizer",
      line1: "Automated internal telecom mediation data pipelines and",
      line2: "interactive geospatial node visualization dashboards",
      line3: "for enterprise network engineering teams.",
      stack: "Java · PostgreSQL · Leaflet.js",
      cta: "CASE STUDY",
    },
    {
      id: "myuthm",
      slug: "myuthm-tvet",
      tag: "PREVIOUS WORK",
      title: "MyUTHM & TVET Ecosystem",
      line1: "Digitized academic quality assessment workflows across",
      line2: "100+ courses and led data-driven usability research &",
      line3: "mobile information architecture overhaul.",
      stack: "React · Flutter · Firebase · Figma",
      cta: "CASE STUDY",
    },
    {
      id: "kursus",
      slug: "kursus-git-github",
      tag: `COMMUNITY · ★ ${stats.starsKursus}`,
      title: "Kursus Git & GitHub (BM)",
      line1: "Interactive 9-chapter Git & GitHub guide in Bahasa Melayu",
      line2: "for IT students and new developers, complete with",
      line3: "HTML/CSS portfolio templates and PDF cheatsheet.",
      stack: "HTML · CSS · Open Education",
      cta: "VIEW REPO",
    },
  ];

  for (const [mode, t] of Object.entries(THEMES)) {
    fs.writeFileSync(
      path.join(OUT_DIR, `hero-${mode}.svg`),
      renderHero(t, stats)
    );
    for (const item of workItems) {
      fs.writeFileSync(
        path.join(OUT_DIR, `work-${item.id}-${mode}.svg`),
        renderWorkCard(t, item)
      );
    }
    for (const r of OSS_ITEMS) {
      fs.writeFileSync(
        path.join(OUT_DIR, `oss-${r.id}-${mode}.svg`),
        renderOssRow(t, r)
      );
    }
    for (const [id, label] of [
      ["threads", "threads"],
      ["email", "email"],
      ["portfolio", "portfolio"],
    ]) {
      fs.writeFileSync(
        path.join(OUT_DIR, `link-${id}-${mode}.svg`),
        renderLinkTile(t, label)
      );
    }
  }

  console.log(`Generated dual-theme SVGs in ${OUT_DIR} for @${USERNAME}`);
}

main();
