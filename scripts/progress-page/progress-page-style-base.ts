// D-058: the palette and type. Warm linen and ink, olive for what is
// finished, madder red for the thread in hand: embroidery (tatreez) colours,
// used quietly. System fonts only: a book serif for Latin, Naskh for Arabic.
export const BASE_STYLE = `
:root{
  --linen:#f3ede2;--card:#fbf8f2;--ink:#1c201d;--soft:#5b5f58;--rule:#d8cfbf;--tack:#a99f8c;
  --olive:#2f5843;--madder:#9e3326;--stitch:rgba(255,248,236,.34);--veil:rgba(28,32,29,.42);
  --pending:#f3dfd2;--pending-ink:#7a2a1f;
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;
  --sans:"Seravek","Gill Sans Nova",Ubuntu,Calibri,"Segoe UI",system-ui,sans-serif;
  --arabic-serif:"Noto Naskh Arabic","Amiri","Geeza Pro","Traditional Arabic","Times New Roman",serif;
  --arabic-sans:"Noto Sans Arabic","SF Arabic","Segoe UI","Geeza Pro",Tahoma,sans-serif;
}
@media (prefers-color-scheme:dark){:root{
  --linen:#131614;--card:#1b1f1c;--ink:#efe8da;--soft:#a9aca3;--rule:#323832;--tack:#6d7066;
  --olive:#79ae90;--madder:#de7361;--stitch:rgba(19,22,20,.4);--veil:rgba(0,0,0,.6);
  --pending:#3a231d;--pending-ink:#f2b7a6;
}}
*{box-sizing:border-box}
html{background:var(--linen);color:var(--ink);-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);font-size:1.0625rem;line-height:1.6}
[lang="ar"] body,[lang="ar"] button{font-family:var(--arabic-sans);font-size:1.1rem}
.page{max-inline-size:68rem;margin-inline:auto;padding:clamp(1.5rem,5vw,4rem) clamp(1rem,4vw,3rem) 4rem}
a{color:inherit;text-underline-offset:.22em;text-decoration-thickness:1px}
.topline{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
.eyebrow{margin:0;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;color:var(--madder);font-weight:600}
[lang="ar"] .eyebrow{letter-spacing:0;font-size:.95rem}
.language{font-size:.95rem}
h1{margin:1.1rem 0 0;max-inline-size:24ch;font-family:var(--serif);font-weight:600;font-size:clamp(2.3rem,6.5vw,4.4rem);line-height:1.04;letter-spacing:-.015em}
[lang="ar"] h1{font-family:var(--arabic-serif);letter-spacing:0;line-height:1.35;max-inline-size:20ch}
.lede{margin:1.4rem 0 0;max-inline-size:36rem;font-size:clamp(1.1rem,2.2vw,1.3rem);color:var(--soft)}
.meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:.75rem 2rem;margin-block-start:2rem;padding-block-start:1.25rem;border-block-start:1px solid var(--rule)}
.now{margin:0;display:flex;gap:.75rem;align-items:baseline;flex:1 1 20rem}
.now-label{flex:none;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--madder)}
[lang="ar"] .now-label{letter-spacing:0;font-size:.9rem}
.now-text{font-family:var(--serif);font-size:1.15rem}
[lang="ar"] .now-text{font-family:var(--arabic-serif)}
.stamp{margin:0;font-size:.85rem;color:var(--soft)}
.portal-link{margin:1rem 0 0;display:flex;flex-wrap:wrap;gap:.25rem .75rem;align-items:baseline;font-size:.95rem}
.portal-link a{font-weight:600}
.portal-link span{color:var(--soft)}
.visually-hidden{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`;
