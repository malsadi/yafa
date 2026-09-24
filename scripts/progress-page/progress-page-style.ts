// D-045: calm and plain, light and dark, phone first, no animation. Colours
// are tokens so the dark scheme only redefines them.
export const PROGRESS_PAGE_STYLE = `
:root{--bg:#fafaf8;--card:#fff;--text:#1f2328;--muted:#5b6168;--line:#d9dcdf;--done:#2f6f4f;--now:#b26a00;--ahead:#e6e8ea;--wait-bg:#fff3d6;--wait-text:#6b4200}
@media (prefers-color-scheme:dark){:root{--bg:#15171a;--card:#1d2024;--text:#e6e8ea;--muted:#a3a9b0;--line:#33383e;--done:#5fb58a;--now:#e0a23a;--ahead:#2c3035;--wait-bg:#3a2e14;--wait-text:#f3d08a}}
*{box-sizing:border-box}
body{margin:0 auto;max-width:46rem;padding:1rem;font-family:system-ui,sans-serif;line-height:1.5;color:var(--text);background:var(--bg)}
h1{font-size:1.5rem;margin-block:.5rem}
.updated,.legend,.dates{color:var(--muted);font-size:.9rem}
.overall{font-weight:600;margin-block:1rem .5rem}
.bar{display:flex;gap:4px;list-style:none;padding:0;margin:0}
.segment{flex:1;height:14px;border-radius:3px;background:var(--ahead)}
.segment.complete{background:var(--done)}
.segment.current{background:repeating-linear-gradient(135deg,var(--now) 0 4px,transparent 4px 8px);outline:2px solid var(--now);outline-offset:-2px}
.legend{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem .9rem}
.key{display:inline-block;inline-size:1rem;block-size:.7rem;border-radius:2px;margin-inline-end:.3rem;vertical-align:middle}
.key.complete{background:var(--done)}.key.current{outline:2px solid var(--now);outline-offset:-2px;background:repeating-linear-gradient(135deg,var(--now) 0 3px,transparent 3px 6px)}.key.ahead{background:var(--ahead)}
.cards{display:flex;flex-direction:column;gap:.75rem;margin-block-start:1.5rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px}
.card.current{border-color:var(--now)}
.card summary{cursor:pointer;padding:.85rem 1rem;display:flex;flex-wrap:wrap;gap:.35rem .75rem;align-items:center;list-style:none}
.card summary::-webkit-details-marker{display:none}
.title{font-weight:600;flex:1 1 16rem}
.badges{display:flex;flex-wrap:wrap;gap:.4rem}
.status,.waiting{font-size:.8rem;border-radius:999px;padding:.1rem .6rem;border:1px solid var(--line)}
.status.complete{color:var(--done);border-color:var(--done)}.status.current{color:var(--now);border-color:var(--now)}.status.ahead{color:var(--muted)}
.waiting{background:var(--wait-bg);color:var(--wait-text);border-color:transparent;font-weight:600}
.line{flex-basis:100%;color:var(--muted);font-size:.95rem}
.detail{padding:0 1rem 1rem;border-block-start:1px solid var(--line)}
.detail h3{font-size:.95rem;margin-block:1rem .25rem}
.detail ul{margin:0;padding-inline-start:1.25rem}
.visually-hidden{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`;

// With JavaScript off, every card's detail is shown (D-045). A <noscript>
// style only applies when scripting is off.
export const NO_SCRIPT_STYLE = `details.card::details-content{content-visibility:visible;display:block}`;
