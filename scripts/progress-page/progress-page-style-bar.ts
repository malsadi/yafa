// D-058, D-064: the one bar, and each phase's panel. Finished cloth is
// olive, stitched through; the phase in hand is being stitched in madder,
// evenly, with no fill level (nothing measures a phase's share done);
// phases ahead are only tacked in outline. Horizontal on a
// wide screen; standing upright on a phone so each segment carries its name.
// The phase in hand: madder stitches over a madder tint, the same all over.
const IN_HAND =
  'repeating-linear-gradient(45deg,var(--madder) 0 1.3px,transparent 1.3px 8px),repeating-linear-gradient(-45deg,var(--madder) 0 1.3px,transparent 1.3px 8px),color-mix(in srgb,var(--madder) 16%,transparent)';
const LATTICE =
  'repeating-linear-gradient(45deg,var(--stitch) 0 1.3px,transparent 1.3px 8px),repeating-linear-gradient(-45deg,var(--stitch) 0 1.3px,transparent 1.3px 8px)';

export const BAR_STYLE = `
.progress{margin-block-start:clamp(2.5rem,7vw,4.5rem)}
.tally{margin:0;font-size:1.05rem;display:flex;align-items:baseline;gap:.55rem;flex-wrap:wrap}
.tally-current{flex-basis:100%;font-size:.95rem;color:var(--madder);font-weight:600}
.tally-figure{font-family:var(--serif);font-size:clamp(3.2rem,8vw,4.8rem);line-height:.9;color:var(--olive)}
.legend{display:flex;flex-wrap:wrap;gap:.5rem 1.6rem;list-style:none;margin:1.25rem 0 0;padding:0;font-size:.85rem;color:var(--soft)}
.legend li{display:flex;align-items:center;gap:.55rem}
.key{inline-size:1.4rem;block-size:.8rem;border-radius:2px}
.key.complete{background:${LATTICE},var(--olive)}
.key.current{background:${IN_HAND};border:1.5px dashed var(--madder)}
.key.ahead{border:1.5px dashed var(--tack)}
.bar{list-style:none;margin:1.6rem 0 0;padding:0;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:6px;border-block-end:1px solid var(--rule);padding-block-end:1.4rem}
.segment button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:.55rem;inline-size:100%;cursor:pointer}
.segment button:focus-visible{outline:2px solid var(--ink);outline-offset:4px;border-radius:4px}
.seg-number{font-family:var(--serif);font-size:1.35rem;font-variant-numeric:oldstyle-nums;color:var(--soft)}
.segment.complete .seg-number{color:var(--olive)}
.segment.current .seg-number{color:var(--madder);font-weight:700}
.seg-cloth{display:block;inline-size:100%;block-size:clamp(5rem,12vw,8rem);border-radius:3px;border:1.5px dashed var(--tack)}
.segment.complete .seg-cloth{border:0;background:${LATTICE},var(--olive)}
.segment.current .seg-cloth{border:1.5px dashed var(--madder);background:${IN_HAND}}
.segment button:hover .seg-cloth{box-shadow:0 0 0 2px var(--linen),0 0 0 3.5px var(--ink)}
.seg-words{display:none}
@media (max-width:44rem){
  .bar{grid-auto-flow:row;grid-auto-columns:auto;gap:0;border-block-end:0}
  .segment{border-block-end:1px solid var(--rule)}
  .segment button{flex-direction:row;align-items:center;gap:1rem;padding-block:.7rem}
  .seg-number{flex:none;inline-size:2rem;text-align:center}
  .seg-cloth{flex:none;inline-size:3.2rem;block-size:2.2rem}
  .seg-words{display:flex;flex-direction:column;min-inline-size:0}
  .seg-name{font-weight:600;line-height:1.3}
  .seg-status{font-size:.85rem;color:var(--soft)}
  .segment.current .seg-status{color:var(--madder);font-weight:600}
}
.panel{inline-size:min(42rem,calc(100vw - 2rem));max-block-size:86vh;overflow:auto;padding:0;border:1px solid var(--rule);border-radius:12px;background:var(--card);color:var(--ink);box-shadow:0 24px 60px -20px rgba(0,0,0,.45)}
.panel::backdrop{background:var(--veil)}
.panel.complete{border-block-start:6px solid var(--olive)}
.panel.current{border-block-start:6px solid var(--madder)}
.panel-head{position:relative;padding:1.5rem 1.6rem 0}
.panel-kicker{margin:0;display:flex;gap:.9rem;flex-wrap:wrap;font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
[lang="ar"] .panel-kicker{letter-spacing:0;font-size:.9rem}
.panel.complete .panel-status{color:var(--olive);font-weight:700}
.panel.current .panel-status{color:var(--madder);font-weight:700}
.panel h2{margin:.5rem 0 0;padding-inline-end:4.5rem;font-family:var(--serif);font-size:clamp(1.5rem,4vw,2rem);line-height:1.2}
[lang="ar"] .panel h2{font-family:var(--arabic-serif);line-height:1.5}
.panel-close{position:absolute;inset-block-start:1.2rem;inset-inline-end:1.2rem;font:inherit;font-size:.85rem;padding:.35rem .8rem;border-radius:999px;border:1px solid var(--rule);background:transparent;color:var(--ink);cursor:pointer}
.panel-close:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.panel-summary{margin:.9rem 1.6rem 0;color:var(--soft);font-size:1.05rem}
.panel-dates{display:flex;flex-wrap:wrap;gap:.5rem 2rem;margin:1.2rem 1.6rem 0;font-size:.9rem}
.panel-dates div{display:flex;flex-direction:column}
.panel-dates dt{color:var(--soft);font-size:.78rem}
.panel-dates dd{margin:0}
.panel-now{margin:1.2rem 1.6rem 0;padding:.8rem 1rem;border-inline-start:3px solid var(--madder);background:color-mix(in srgb,var(--madder) 7%,transparent);font-family:var(--serif)}
[lang="ar"] .panel-now{font-family:var(--arabic-serif)}
.panel-now span{display:block;font-family:var(--sans);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--madder);font-weight:700}
.panel h3{margin:1.4rem 0 .5rem;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
[lang="ar"] .panel h3{letter-spacing:0;font-size:.95rem}
.panel ul{margin:0;padding-inline-start:1.1rem}
.panel li{margin-block-end:.35rem}
.panel-pending{margin:0 1.6rem}
.panel-pending ul{list-style:none;padding:0}
.panel-pending li{padding:.6rem .85rem;border-radius:6px;background:var(--pending);color:var(--pending-ink)}
.panel-columns{display:grid;gap:0 2rem;padding:0 1.6rem 1.6rem}
@media (min-width:40rem){.panel-columns{grid-template-columns:1fr 1fr}}
@media (max-width:44rem){.panel{inline-size:100vw;max-inline-size:100vw;margin:auto 0 0;border-radius:14px 14px 0 0;max-block-size:88vh}}
`;

// With JavaScript off, every phase's panel is shown in order below the bar,
// open and in the page's flow (D-058). A <noscript> style applies only then.
export const NO_SCRIPT_STYLE = `.panel{display:block;position:static;inset:auto;margin:2rem 0 0;inline-size:auto;max-block-size:none;overflow:visible;box-shadow:none}.panel-close{display:none}`;
