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

function buildWaveRects(t) {
  const rects = [];
  for (let x = 0; x < 86; x++) {
    const h = Math.round(
      2 + Math.sin(x * 0.25) * 2.8 + Math.cos(x * 0.14) * 2.2 + ((x * 13) % 4)
    );
    for (let y = 0; y < 10; y++) {
      const dist = Math.abs(y - (9 - h));
      const fill =
        dist === 0
          ? t.waveHi
          : dist === 1
          ? t.waveMid
          : y > 9 - h
          ? t.waveLow
          : t.waveOff;
      rects.push(
        `<rect x="${20 + x * 10}" y="${36 + y * 7.5}" width="6" height="5" fill="${fill}"/>`
      );
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
  <text x="880" y="23" text-anchor="end" font-family="${FONT_MONO}" font-size="11" fill="${t.muted}" letter-spacing="0.4">github.com/zfrnaa · Kuala Lumpur, MY</text>
  ${buildWaveRects(t)}

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

function renderOss(t) {
  const rows = [
    {
      repo: "kunkka19xx/look",
      pr: "feat(gpui): inline preview actions & Run as administrator (Ctrl+Shift+Enter)",
    },
    {
      repo: "kunkka19xx/lookbook",
      pr: "feat(timezone): add Windows support and clock mode to bin/timezone",
    },
    {
      repo: "muazhazali/caripasarmalam",
      pr: "PasarMalam.app — map UX, direction chooser & navigation for 1,000+ markets",
    },
    {
      repo: "syvixor/skills-icons",
      pr: "docs: add Bahasa Melayu (Malay) translation for community documentation",
    },
  ];
  const rowHeight = 46;
  const totalHeight = rows.length * rowHeight + 2;
  const rowSvg = rows
    .map((r, i) => {
      const y = i * rowHeight;
      const line =
        i > 0
          ? `<line x1="1" y1="${y}" x2="899" y2="${y}" stroke="${t.border}"/>`
          : "";
      return `${line}
      <text x="18" y="${y + 27}" font-family="${FONT_MONO}" font-size="12" font-weight="700" fill="${t.text}">${esc(r.repo)}</text>
      <text x="242" y="${y + 27}" font-family="${FONT_SANS}" font-size="12.5" fill="${t.muted}">${esc(r.pr)}</text>
      <text x="882" y="${y + 27}" text-anchor="end" font-family="${FONT_MONO}" font-size="11" font-weight="700" fill="${t.merged}">● MERGED</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${totalHeight}" viewBox="0 0 900 ${totalHeight}" role="img" aria-label="Open-Source Contributions">
  <rect x="0.5" y="0.5" width="899" height="${totalHeight - 1}" fill="${t.surface}" stroke="${t.border}"/>
  ${rowSvg}
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
    fs.writeFileSync(path.join(OUT_DIR, `oss-${mode}.svg`), renderOss(t));
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
