// D-056: calm and dignified, light and dark, phone first, no animation. The
// fonts are system stacks only: a book serif for headings, a humanist sans
// for reading. Colours are tokens, so the dark scheme only redefines them.
const TOKENS = `
:root{
  --paper:#f6f3ec;--card:#fffdf8;--ink:#1f2622;--soft:#5d655f;--rule:#dcd6c8;
  --complete:#2f5d4a;--current:#a8702a;--ahead:#e3ddcf;--pending-bg:#f3e6cc;--pending-ink:#6a4412;
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,"Times New Roman",serif;
  --sans:"Seravek","Gill Sans Nova",Ubuntu,Calibri,"DejaVu Sans","Segoe UI",system-ui,sans-serif;
}
@media (prefers-color-scheme:dark){:root{
  --paper:#151816;--card:#1c201d;--ink:#ece7dc;--soft:#a7ada6;--rule:#343a35;
  --complete:#7fb89c;--current:#dba45c;--ahead:#2d322e;--pending-bg:#3a2d18;--pending-ink:#f0cf9a;
}}`;

const PAGE = `
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);font-size:1.0625rem;line-height:1.6}
main{max-inline-size:44rem;margin-inline:auto;padding:3rem 1.25rem 4rem}
a{color:inherit;text-underline-offset:.2em;text-decoration-thickness:1px}
.masthead{padding-block-end:2rem;border-block-end:1px solid var(--rule)}
.eyebrow{margin:0 0 .75rem;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
h1{margin:0;font-family:var(--serif);font-weight:600;font-size:clamp(2rem,6vw,2.75rem);line-height:1.15;letter-spacing:-.01em}
.lede{margin:1rem 0 0;font-size:1.15rem;color:var(--soft);max-inline-size:34rem}
.portal-link{margin:1.5rem 0 0;display:flex;flex-wrap:wrap;gap:.25rem .75rem;align-items:baseline;font-size:.95rem}
.portal-link a{font-weight:600}
.portal-link span{color:var(--soft)}
h2{font-family:var(--serif);font-weight:600;font-size:1.35rem;margin:3rem 0 1.25rem}
footer{margin-block-start:3rem;padding-block-start:1.25rem;border-block-start:1px solid var(--rule);color:var(--soft);font-size:.9rem}
.visually-hidden{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;

const OVERVIEW = `
.overview{padding-block-start:2rem}
.tally{display:flex;align-items:baseline;gap:.6rem;margin:0 0 1.25rem}
.tally-figure{font-family:var(--serif);font-size:3.25rem;line-height:1;color:var(--complete)}
.tally-words{font-size:1.05rem}
.bar{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:5px;list-style:none;margin:0;padding:0}
.segment{display:flex;flex-direction:column;gap:.4rem;min-inline-size:0}
.segment-fill{display:block;block-size:.7rem;border-radius:2px;background:var(--ahead)}
.segment.complete .segment-fill{background:var(--complete)}
.segment.current .segment-fill{background:repeating-linear-gradient(135deg,var(--current) 0 3px,transparent 3px 7px);box-shadow:inset 0 0 0 1.5px var(--current)}
.segment-number{font-size:.72rem;text-align:center;color:var(--soft);font-variant-numeric:tabular-nums}
.segment.current .segment-number{color:var(--current);font-weight:700}
.legend{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;list-style:none;margin:1.25rem 0 0;padding:0;font-size:.85rem;color:var(--soft)}
.legend li{display:flex;align-items:center;gap:.5rem}
.key{inline-size:1.1rem;block-size:.55rem;border-radius:2px;background:var(--ahead)}
.key.complete{background:var(--complete)}
.key.current{background:repeating-linear-gradient(135deg,var(--current) 0 3px,transparent 3px 7px);box-shadow:inset 0 0 0 1.5px var(--current)}`;

const CARDS = `
.card{background:var(--card);border:1px solid var(--rule);border-radius:10px;margin-block-end:.9rem}
.card.current{border-color:var(--current);box-shadow:inset 3px 0 0 var(--current)}
.card summary{display:flex;gap:1.1rem;padding:1.25rem 1.25rem 1.2rem;cursor:pointer;list-style:none}
.card summary::-webkit-details-marker{display:none}
.card summary:focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:10px}
.card-number{flex:none;inline-size:2.25rem;font-family:var(--serif);font-size:2rem;line-height:1.1;text-align:center;color:var(--soft)}
.card.complete .card-number{color:var(--complete)}.card.current .card-number{color:var(--current)}
.card-body{display:flex;flex-direction:column;gap:.35rem;flex:1;min-inline-size:0}
.card-title{font-family:var(--serif);font-size:1.2rem;font-weight:600;line-height:1.3}
.card-summary{color:var(--soft)}
.card-meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;margin-block-start:.25rem;font-size:.85rem}
.status{display:inline-flex;align-items:center;gap:.45rem;font-weight:600}
.status::before{content:"";inline-size:.55rem;block-size:.55rem;border-radius:50%;background:var(--ahead);box-shadow:inset 0 0 0 1px var(--soft)}
.status.complete{color:var(--complete)}.status.complete::before{background:var(--complete);box-shadow:none}
.status.current{color:var(--current)}.status.current::before{background:var(--current);box-shadow:none}
.status.ahead{color:var(--soft);font-weight:500}
.pending{padding:.1rem .65rem;border-radius:999px;background:var(--pending-bg);color:var(--pending-ink);font-weight:600}
.card summary::after{content:"";flex:none;inline-size:.6rem;block-size:.6rem;margin-block-start:.55rem;border-inline-end:1.5px solid var(--soft);border-block-end:1.5px solid var(--soft);transform:rotate(45deg)}
.card[open] summary::after{transform:rotate(225deg);margin-block-start:.85rem}
.detail{padding:0 1.25rem 1.4rem calc(1.25rem + 2.25rem + 1.1rem);border-block-start:1px solid var(--rule)}
.detail h3{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--soft);margin:1.35rem 0 .5rem;font-weight:600}
.detail ul{margin:0;padding-inline-start:1.1rem}
.detail li{margin-block-end:.3rem}
.detail li::marker{color:var(--soft)}
.dates{display:flex;flex-wrap:wrap;gap:.5rem 2rem;margin:1.25rem 0 0;font-size:.9rem}
.dates div{display:flex;flex-direction:column}
.dates dt{color:var(--soft);font-size:.78rem}
.dates dd{margin:0}
.pending-list ul{list-style:none;padding:0}
.pending-list li{padding:.55rem .8rem;border-radius:6px;background:var(--pending-bg);color:var(--pending-ink)}
.columns{display:grid;gap:0 2rem}
@media (min-width:40rem){.columns{grid-template-columns:1fr 1fr}}
.quiet{color:var(--soft);margin:1.25rem 0 0}
@media (max-width:30rem){.detail{padding-inline-start:1.25rem}.card summary{gap:.8rem}.card-number{inline-size:1.6rem;font-size:1.6rem}}`;

export const PROGRESS_PAGE_STYLE = TOKENS + PAGE + OVERVIEW + CARDS;

// With JavaScript off, every card's detail is shown (D-045). A <noscript>
// style only applies when scripting is off.
export const NO_SCRIPT_STYLE = `details.card::details-content{content-visibility:visible;display:block}.card summary::after{display:none}`;
