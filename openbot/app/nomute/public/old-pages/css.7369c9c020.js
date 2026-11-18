/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 같이 쓰는 옷) · 원본 = tokens.css · nm-shared.css · nm-cards.css · nm-hist.css · nm-job.css · nm-clip.css · nm-input.css · nm-scene-tokens.css · nm-scene.css */
const r={"tokens.css":`.nd-root {
  --r-l: 16px;
  --r-m: 11px;
  --r-s: 9px;
  --r-pill: 999px;
  --r-modal: 22px;
  --sp-1: 6px;
  --sp-2: 12px;
  --sp-3: 18px;
  --sp-4: 24px;
  --blur-s: 8px;
  --blur-m: 14px;
  --blur-l: 22px;
  --blur-xl: 30px;
  --blur-backdrop: 7px;
  --btn: 34px;
  --btn-sm: 30px;
  --btn-xs: 22px;
  --btn-lg: 46px;
  --trailw: 70px;
  --fs-display: 22px;
  --fs-h1: 19px;
  --fs-h2: 15px;
  --fs-h3: 14px;
  --fs-label: 13px;
  --fs-body: 15px;
  --fs-sm: 12px;
  --fs-xs: 11px;
  --fw-b: 700;
  --fw-x: 800;
  --lh-base: 1.6;
  --ease: cubic-bezier(.2,.7,.3,1);
  --dur: .18s;
  --dur-fast: .12s;
  --dur-acc: .26s;
  --gauge-ease: cubic-bezier(.22,.61,.36,1);
  --gauge-pop: 1.15;
  --font-status: 'Pretendard Variable',-apple-system,BlinkMacSystemFont,sans-serif;
  --z-nav: 35;
  --z-remote: 36;
  --z-remote-pop: 41;
  --z-float: 60;
  --z-toast: 90;
  --z-reason: 130;
  --z-min-ghost: 199;
  --z-min: 200;
  --z-min-pop: 201;
  --z-min-shield: 205;
  --z-min-chip: 206;
  --z-lock: 300;
  --press-pico: .72;
  --press-xs: .82;
  --press-s: .85;
  --press-m: .9;
  --press-l: .95;
}`,"nm-shared.css":`nd-html::-webkit-scrollbar, nd-body::-webkit-scrollbar { width:0; height:0; display:none;}   
::-webkit-scrollbar { width:5px; height:5px;}   
::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,.08); background-clip:padding-box;}   
button:focus-visible, a:focus-visible, [tabindex]:focus-visible, [role=button]:focus-visible, label.file:focus-visible { outline:2px solid var(--accent); outline-offset:2px;}   
button, input, textarea, select { font-family:inherit; letter-spacing:inherit;}   
.go:active { transform:scale(.955); background:rgba(var(--accent-rgb),.08); border-color:rgba(var(--accent-rgb),.35);}   
.go.glive.firing.gdone { background-size:100% 100%, 100% 100%; transition:background-size .3s linear;}   
.go.firing { color:var(--on-accent); pointer-events:none; opacity:1;
    background:linear-gradient(var(--accent),var(--accent)) left/0% 100% no-repeat, linear-gradient(var(--accent-dim),var(--accent-dim));
    animation:goFill .72s var(--gauge-ease) forwards;}   
.go.checking { display:grid; place-items:center;}   
.go .gck path { fill:none; stroke:var(--on-accent); stroke-width:2.7; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:24; stroke-dashoffset:24; animation:goTick .38s .04s ease forwards;}   
.gospec .gs-dot { color:var(--mut); opacity:.45; font-style:normal; font-weight:400; margin:0 3px ;}   
.gdots { display:inline-block; width:1.1em; text-align:left;}   
.gdots i { font-style:normal; opacity:0; animation:gdots 1.4s infinite;}   
.code button { position:absolute; top:8px; right:8px; display:grid; place-items:center; width:30px; height:30px; padding:0;
    color:rgba(255,255,255,.92); background:rgba(8,15,11,.4); border:1px solid rgba(255,255,255,.14); border-radius:var(--r-s); cursor:pointer;
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur);}   
.code button.done { background:var(--accent); color:var(--on-accent); border-color:var(--accent);}   
.code button.copied { color:var(--mut); border-color:rgba(255,255,255,.08);}   
.firebar { position:static; padding:0; background:none;}   
.firebar .inner { max-width:600px; margin:0 auto;}   
.ogrid { display:flex; flex-direction:column; gap:8px ;}   
.ogrid .geni-row { padding:8px 13px ; border:1px solid rgba(255,255,255,.06) ; background:rgba(255,255,255,.015) ; border-radius:var(--r-s); align-items:center; gap:7px; min-width:0;}   
.ogrid .pub-l::after { content:'│'; margin-left:7px ; color:var(--mut); opacity:.35; font-weight:400;}   
.ogrid .geni-opts { justify-content:flex-start; gap:3px 4px;}   
.optstrip .gs-sep { color:var(--mut); opacity:.45; font-weight:400; margin:0 5px ;}   
.cpv-bg, .vstage > video { will-change:transform;}   
.nm-rbs { position:relative; display:block; flex:1 1 auto; min-width:0; height:32px ; touch-action:pan-y ; cursor:pointer; -webkit-tap-highlight-color:transparent; --p:.5;}
.nm-rbs > .nm-rbs-in { position:absolute; inset:0; width:100%; height:100%; margin:0; opacity:0; pointer-events:none;}
.nm-rbs-track { position:absolute; left:0; right:0; top:50%; height:6px ; margin-top:-3px ; border-radius:var(--r-pill); background:rgba(255,255,255,.08) ;}
.nm-rbs-fill { position:absolute; inset:0; border-radius:inherit; background:var(--accent); transform-origin:left center; transform:scaleX(var(--p));}
.nm-rbs-knob { position:absolute; left:0; right:0; top:50%; height:0; transform:translateX(calc((var(--p) - 1) * 100%));}
.nm-rbs-knob::after { content:''; position:absolute; right:-9px ; top:-9px ; width:18px ; height:18px ; border-radius:50%; background:var(--fg); box-shadow:0 1px 4px rgba(0,0,0,.45) ; transition:transform var(--dur-fast) ease;}
.nm-rbs.drag .nm-rbs-knob::after { transform:scale(var(--gauge-pop,1.15));}
.nm-rbs.snap .nm-rbs-fill, .nm-rbs.snap .nm-rbs-knob { transition:transform .5s cubic-bezier(.34,1.56,.64,1) ;}
.nm-rbs:not([data-ptr]):has(> .nm-rbs-in:focus-visible) { outline:2px solid rgba(var(--accent-rgb),.6); outline-offset:4px ; border-radius:var(--r-s);}
.nm-rbs:has(> .nm-rbs-in:disabled) { opacity:.4; cursor:default;}
@media (prefers-reduced-motion:reduce) { .nm-rbs.snap .nm-rbs-fill, .nm-rbs.snap .nm-rbs-knob { transition:none;} .nm-rbs.drag .nm-rbs-knob::after { transform:none;} }
.nm-snap { position:relative; display:flex; flex-wrap:nowrap; gap:0; min-width:0; padding:5px 0 ; border:0; box-shadow:inset 0 0 0 1px var(--line) ; border-radius:var(--r-pill); outline:1px solid transparent; outline-offset:-1px ; background:rgba(255,255,255,.03) ;}
.nm-snap::before { content:''; position:absolute; top:5px; bottom:5px; left:5px ; width:calc(100% / var(--n,1) - 10px) ; border-radius:var(--r-pill); background:var(--accent); pointer-events:none; transform:translateX(calc(var(--i,0) * (100% + 10px))) ; transition:transform .45s cubic-bezier(.34,1.56,.64,1) ;}
.nm-snap.none::before { opacity:0;}
.nm-snap > button { position:relative; z-index:1; flex:1 1 0; min-width:0; height:auto; margin:0 5px ; padding:calc(var(--sp-1) + 2px) 1px calc(var(--sp-1) - 2px) ; border:0; border-radius:var(--r-pill); background:none; color:var(--mut); font-family:inherit; font-size:var(--fs-label); font-weight:var(--fw-b); line-height:1.3 ; text-align:center; justify-content:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color var(--dur), transform .3s cubic-bezier(.34,1.56,.64,1) ;}
.nm-snap > button.on, .nm-snap > button[aria-checked="true"] { color:var(--on-accent); font-weight:var(--fw-x); background:none; border:0;}
.nm-snap > button:active { transform:scale(var(--press-m));}
.nm-snap > button:disabled { opacity:.32 ; cursor:default;}
@media (hover:hover) { .nm-snap > button:not(.on):not(:disabled):hover { color:var(--fg);} }
@media (prefers-reduced-motion:reduce) { .nm-snap::before { transition:none;} }
.nm-alpha { position:relative;}
.nm-alpha > canvas { display:block; width:100%; height:auto; object-fit:contain; background:repeating-conic-gradient(var(--line) 0% 25%, var(--pan) 0% 50%) 0 0/22px 22px; cursor:pointer; -webkit-tap-highlight-color:transparent;}
div.nm-alpha > video { position:absolute; left:0; top:0; width:1px; height:1px; min-height:0; max-height:none; margin:0; border:0; opacity:0; pointer-events:none;}   
.nm-alpha .monplay { position:absolute; inset:0; margin:auto; width:var(--btn); height:var(--btn); display:grid; place-items:center; padding:0; border-radius:50%;
  border:1px solid rgba(255,255,255,.17); background:rgba(26,28,26,.3); color:var(--fg); box-shadow:inset 0 1px 0 rgba(255,255,255,.2);
  -webkit-backdrop-filter:blur(var(--blur-m)) saturate(1.3); backdrop-filter:blur(var(--blur-m)) saturate(1.3); pointer-events:none;}   
.nm-alpha .monplay svg { width:16px; height:16px; transform:translateX(1px);}   
.nm-alpha .monplay[hidden] { display:none;}
.nm-alpha .monseek { position:absolute; left:0; right:0; bottom:0; height:3px; background:rgba(255,255,255,.15); cursor:pointer; touch-action:none; -webkit-tap-highlight-color:transparent;}   
.nm-alpha .monseek::before { content:''; position:absolute; left:0; right:0; top:-9px; bottom:-3px;}   
.nm-alpha .monseek i { position:absolute; left:0; top:0; bottom:0; width:0%; background:var(--accent); pointer-events:none;}
.ic-swap { transform-origin:center; animation:icSwap .14s cubic-bezier(.2,.9,.3,1.25) both; }   
@keyframes icSwap { from { transform:scale(.5); opacity:0; } }   
@media (prefers-reduced-motion:reduce) { .ic-swap { animation:none; } }`,"nm-cards.css":`.dlbtn { color:var(--accent-4) !important; background:rgba(var(--accent-4-rgb),.10) !important; border-color:rgba(var(--accent-4-rgb),.22) !important; filter:drop-shadow(0 1px 2px rgba(0,0,0,.45)); }
@media (hover:hover){ .dlbtn:hover { background:rgba(var(--accent-4-rgb),.16) !important; } }   
.dlbtn.dl-done { color:var(--mut) !important; }
.imgdl.dlbtn,
.timg-dl.dlbtn,
.slide-acts .save.dlbtn, .slide-acts .ovl.dlbtn,
.lbox-bar .lbox-dl.dlbtn,
.ftit .ftdl.dlbtn { background:var(--bg) !important; border-color:transparent !important; }
@media (hover:hover){
  .imgdl.dlbtn:hover,
  .timg-dl.dlbtn:hover,
  .slide-acts .save.dlbtn:hover, .slide-acts .ovl.dlbtn:hover,
  .lbox-bar .lbox-dl.dlbtn:hover,
  .ftit .ftdl.dlbtn:hover { background:var(--bg) !important; }
}
.imgdl.dlbtn.dl-done, .imgdl.dlbtn.dl-done:hover { color:var(--mut) !important; }   
.dlbtn .dl-ack { position:absolute; inset:0; border-radius:inherit; overflow:hidden; display:grid; place-items:center; pointer-events:none; z-index:6; color:var(--accent-4); }
.dlbtn .dl-ack > svg { width:18px; height:18px; filter:drop-shadow(0 1px 2px rgba(0,0,0,.5)); animation:dlAckPop .7s cubic-bezier(.18,1.5,.4,1) forwards; }   
.dlbtn .dl-ack .dl-ring { position:absolute; inset:0; border-radius:inherit; border:1.5px solid rgba(var(--accent-4-rgb),.7); animation:dlRing .55s ease-out forwards; }
.dlbtn:has(.dl-ack) > svg { opacity:0; }   
@keyframes dlAckPop { 0%{opacity:0;transform:scale(0)} 30%{opacity:1;transform:scale(1.15)} 55%{transform:scale(1)} 80%{opacity:1} 100%{opacity:0;transform:scale(1)} }
@keyframes dlRing { from{transform:scale(.35);opacity:.9} to{transform:scale(1);opacity:0} }   
@media (prefers-reduced-motion:reduce){ .dlbtn .dl-ack > svg, .dlbtn .dl-ack .dl-ring { animation:none; } .dlbtn .dl-ack { opacity:0; } .dlbtn:has(.dl-ack) > svg { opacity:1; } }   
.imgdl.dlbtn .dl-ack, .jvar-dl.dlbtn .dl-ack, .cref-dlall.dlbtn .dl-ack,
.timg-dl.dlbtn .dl-ack, .slide-acts .save.dlbtn .dl-ack, .slide-acts .ovl.dlbtn .dl-ack, .lbox-dl.dlbtn .dl-ack { display:none !important; }
.cref-dlall.dlbtn { color:var(--accent-4) !important; background:transparent !important; border-color:transparent !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; box-shadow:none !important; }
@media (hover:hover){ .cref-dlall.dlbtn:hover { background:rgba(255,255,255,.06) !important; } }   
.cref-dlall.dlbtn::before { display:none; }   
.cref-dlall.dlbtn.dl-done, .cref-dlall.dlbtn.dl-done .cref-dllbl { color:var(--mut) !important; }
.cref-dlall.dlbtn.dlseq-busy, .cref-dlall.dlbtn.dlseq-done, .cref-dlall.dlbtn.dlseq-busy .cref-dllbl, .cref-dlall.dlbtn.dlseq-done .cref-dllbl { color:var(--accent-4) !important; }   
.job .jvar-dl.dlbtn { background:transparent !important; border-color:transparent !important; color:var(--accent-4) !important; filter:none; }   
@media (hover:hover){ .job .jvar-dl.dlbtn:hover { background:transparent !important; color:var(--accent-4) !important; } }
.job .jvar-dl.dlbtn.dl-done, .job .jvar-dl.dlbtn.dl-done:hover { color:var(--mut) !important; }
.job.done .jst { color:var(--fg); }   
.job .jsave-row .imgedit { background:transparent; color:var(--fg); }   
.job .jsave-row .imgedit:active { color:var(--accent); }   
.sbtn { display:grid; place-items:center; width:34px; height:34px; padding:0; color:rgba(255,255,255,.92); text-decoration:none;
  background:rgba(8,15,11,.3); border:1px solid rgba(255,255,255,.14); border-radius:10px; cursor:pointer;
  backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur); }   
.sbtn svg { display:block; }
.sbtn:hover:not(:disabled) { background:rgba(255,255,255,.16); }
.sbtn:active { transform:scale(var(--press-s,.85)); }
.cref-dlall { position:relative; overflow:hidden; width:auto; height:var(--btn); border-radius:var(--r-s); display:inline-flex; align-items:center; gap:5px; padding:0 11px; }   
.cref-dlall > svg, .cref-dlall .dlseq-ic, .cref-dlall .cref-dllbl { position:relative; z-index:1; }
.cref-dlall .cref-dllbl { font-size:var(--fs-xs); font-weight:700; color:inherit; white-space:nowrap; transition:color var(--dur); }
.cref-dlall .dlseq-ic { width:15px; height:15px; display:inline-grid; }`,"nm-hist.css":`@keyframes histOut { from { opacity:1; transform:none; } to { opacity:0; transform:translateY(8px) scale(.99); } }
  .imgdl { position:absolute; top:10px; right:10px; width:34px; height:34px; display:grid; place-items:center; border:0; border-radius:10px; text-decoration:none; z-index:2; transition:transform var(--dur-fast), background var(--dur), color var(--dur); }   
  .hist { margin-top:20px; padding-top:14px; border-top:1px solid var(--line2); }   
  .hist-h:active, .geni-histfold:active { transform:scale(var(--press-l)); }   
  .hist-h, .geni-histfold { width:100%; display:flex; align-items:center; gap:8px; background:none; border:none; color:var(--fg); cursor:pointer; padding:10px 2px; font:inherit; font-size:13px; font-weight:700; -webkit-tap-highlight-color:transparent; }   
  .hist-h[hidden] { display:none; }   
  .hist-ttl, .geni-histttl { display:inline-flex; align-items:center; gap:6px; transition:color .3s ease, text-shadow .3s ease; }
  .hist.open .hist-ttl { color:var(--accent); text-shadow:0 0 10px rgba(var(--accent-rgb),.45); }   
  .hist { scroll-margin-top:14px; }   
  .hist-cnt, .geni-histcnt { color:var(--mut); font-weight:600; font-size:12px; }   
  .hist-empty, .geni-histempty { color:var(--mut); font-size:var(--fs-sm); font-weight:var(--fw-b); padding:14px 2px 6px ; text-align:center; }   
  .hist-ar, .geni-histchev { margin-left:auto; color:var(--hist-accent); transition:transform var(--dur), color .3s ease; }      
  .hist.open .hist-ar { transform:rotate(180deg); }
  #histRemote { position:fixed; left:50%; bottom:calc(env(safe-area-inset-bottom) + 12px); transform:translateX(-50%) translateY(10px); z-index:71;   
    display:inline-flex; align-items:center; gap:5px; padding:9px 15px; border-radius:999px; cursor:pointer; font:inherit; font-size:12.5px; font-weight:700; white-space:nowrap;
    color:var(--hist-accent); background:rgba(18,14,26,.7); backdrop-filter:blur(14px) saturate(1.2); -webkit-backdrop-filter:blur(14px) saturate(1.2);
    border:1px solid rgba(var(--hist-rgb),.4); box-shadow:0 10px 26px rgba(0,0,0,.55), 0 0 14px rgba(var(--hist-rgb),.18);
    opacity:0; pointer-events:none; transition:opacity .25s ease, transform .25s var(--gauge-ease); }
  #histRemote.show { opacity:1; transform:translateX(-50%) translateY(0); pointer-events:auto; }
  #histRemote:active { transform:translateX(-50%) translateY(0) scale(var(--press-m)); }
  @media (prefers-reduced-motion:reduce){ #histRemote { transition:opacity var(--dur); } }
  nd-body:has(> #histRemote) .hist.open { padding-bottom:calc(env(safe-area-inset-bottom) + 12px + 40px); }   
  .hist-body { margin-top:6px; }
  .hist-tools { display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-bottom:10px; }
  .hist-note, .geni-histnote { color:var(--mut); font-size:11px; font-weight:500; margin-left:9px; }      
  .hist-bul { color:var(--hist-accent); font-size:var(--fs-label); font-weight:var(--fw-b); transition:color .3s ease; }   
  .hist.open .hist-bul { color:var(--accent); }
  .hist-clr:active { transform:scale(var(--press-m)); }   
  .hist-clr { background:rgba(255,255,255,.05); border:1px solid var(--line); color:var(--mut); font:inherit; font-size:11px; padding:4px 10px; border-radius:8px; cursor:pointer; transition:color var(--dur), background var(--dur), border-color var(--dur); }
  .hist-clr:hover { color:var(--fg); border-color:rgba(255,255,255,.2); }
  .hist-clr.arm { color:var(--amber); border-color:var(--amber); background:rgba(var(--amber-rgb),.15); }
  .hist-clr.firing { color:var(--on-accent); border-color:var(--accent); pointer-events:none;
    background:linear-gradient(var(--accent),var(--accent)) left/0% 100% no-repeat, rgba(255,255,255,.05); animation:goFill .46s var(--gauge-ease) forwards; }
  @media (prefers-reduced-motion:reduce) { .hist-clr.firing { animation-duration:.15s; } }
  .hist-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px 10px; }
  .jobs + .hist-grid { margin-top:var(--sp-3); }   
  .nm-rail { display:flow-root; margin-top:var(--sp-3); }      
  .hist-grid[hidden] { display:none; }      
  .hist-grid > .hist-it { animation:histIn .32s var(--gauge-ease) both; }
  .hist-grid > .hist-it:nth-child(2){ animation-delay:.04s } .hist-grid > .hist-it:nth-child(3){ animation-delay:.08s }
  .hist-grid > .hist-it:nth-child(4){ animation-delay:.12s } .hist-grid > .hist-it:nth-child(5){ animation-delay:.16s }
  .hist-grid > .hist-it:nth-child(n+6){ animation-delay:.2s }
  @keyframes histIn { from { opacity:0; transform:translateY(10px) scale(.985); } to { opacity:1; transform:none; } }
  #histBody.closing, .hist-body.closing, #geniResBody.closing, #geniPrevBody.closing { animation:histOut .26s cubic-bezier(.4,0,.7,.3) both; }   
  @media (prefers-reduced-motion:reduce) { .hist-grid > .hist-it, #histBody.closing, .hist-body.closing, #geniResBody.closing, #geniPrevBody.closing, #geniResBody .geni-histbody-in > *, #geniPrevBody .geni-histbody-in > * { animation:none; } }
  .hist-it { display:flex; flex-direction:column; }
  .hist-grid > .hist-it { content-visibility:auto; contain-intrinsic-height:auto 301px; }   
  .hist-hd { color:var(--fg); font-size:11.5px; font-weight:600; margin:0 7px 6px 7px; display:flex; align-items:baseline; }   
  .hist-hd .hfmt { margin-left:auto; }   
  .hist-thumb { position:relative; }
  .hist-thumb img { width:100%; aspect-ratio:4/5; object-fit:cover; border:1px solid var(--line); border-radius:var(--r-s); display:block; background:var(--pan); }
  .hist-thumb video { width:100%; aspect-ratio:16/9; object-fit:cover; border:1px solid var(--line); border-radius:var(--r-s); display:block; background:var(--pan); }   
  .hist-thumb.hist-go { cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast); }
  .hist-thumb.hist-go img, .hist-thumb.hist-go video { transition:border-color var(--dur); }
  .hist-thumb.hist-go:hover img, .hist-thumb.hist-go:hover video { border-color:rgba(var(--accent-rgb),.34); }
  .hist-thumb.hist-go:active { transform:scale(var(--press-l)); }
  .hist-thumb:has(> .imgdl, > .imgedit), .carslide:has(> .imgdl, > .imgedit) { padding-bottom:calc(28px + var(--sp-1)); }   
  .hist-thumb .imgdl, .carslide .imgdl { top:auto; bottom:0; right:6px; width:28px; height:28px; }   
  .hist-thumb .imgdl svg, .carslide .imgdl svg { width:12px; height:12px; }
  .imgedit { position:absolute; top:10px; width:34px; height:34px; display:grid; place-items:center; border:0; border-radius:10px; z-index:2; cursor:pointer; color:var(--accent); background:var(--bg); transition:transform var(--dur-fast); }      
  .imgedit:active { transform:scale(var(--press-xs,.82)); }
  .imgedit svg { width:14px; height:14px; }
  .hist-thumb .imgedit, .carslide .imgedit { top:auto; bottom:0; right:40px; width:28px; height:28px; }   
  .hist-thumb .imgedit svg, .carslide .imgedit svg { width:12px; height:12px; }
  .hist-cap { position:absolute; left:6px; top:6px; max-width:calc(100% - 42px); background:var(--bg); color:var(--fg); font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:999px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }   
  .hist-cap-v { font-weight:400; }
  @container nd (max-width:480px) { .hist-grid { grid-template-columns:repeat(2,1fr); } }
  #resGrid, #geniResGrid { grid-template-columns:repeat(2,1fr); }
  #resGrid .hist-thumb img, #geniResGrid .hist-thumb img { aspect-ratio:auto; }   
  #resGrid .hist-hd, #geniResGrid .hist-hd { display:none; }   
.car-h, #geniResH { margin-top:14px; border-top:1px solid var(--line2); padding-top:14px; }   
.car-h .car-bul, .geni-histbul { color:var(--accent); font-size:var(--fs-label); font-weight:var(--fw-b); }   
.car-h[aria-expanded="true"] .hist-ar { transform:rotate(180deg); }
.car-h[aria-expanded="true"] .hist-ttl { color:var(--accent); }   
#geniResBody, #geniPrevBody { display:block; transition:none; }
#geniResBody[hidden], #geniPrevBody[hidden] { display:none; }   
#geniResBody .geni-histbody-in > *, #geniPrevBody .geni-histbody-in > * { animation:histIn .32s var(--gauge-ease) both; }   
#geniOut .geni-histwrap:has(.geni-histfold.prev) { margin-top:20px; padding-top:14px; border-top:1px solid var(--line2); }   
#geniOut .geni-histbody { margin-top:6px; }   
#resBody, #geniOut #geniResBody { margin-top:10px; }   
#geniOut #geniResBody .geni-histbody-in > .jobs { margin-top:0; }   
#geniOut .geni-histfold.prev[aria-expanded="true"] .geni-histttl { color:var(--accent); text-shadow:0 0 10px rgba(var(--accent-rgb),.45); }   
#geniOut .geni-histfold.prev[aria-expanded="true"] .geni-histbul { color:var(--accent); }   
#geniOut { --pan:#16171a; --line:#2a2c31; }   
#geniOut .geni-histchev { width:auto; }   
#geniOut .geni-histchev svg { transition:transform var(--dur); }   
@media (prefers-reduced-motion:reduce) { .hist-ar, #geniOut .geni-histchev svg { transition:none; } }
#geniOut button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }`,"nm-job.css":`.jobs { display:flex; flex-direction:column; gap:6px; margin:10px 0 0; }
  .jobs[hidden] { display:none; }   
  .job { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:12px; padding:8px 11px; border-radius:var(--r-s); background:rgba(8,15,11,.34); border:1px solid var(--line); }   
  .job .jlab { font-weight:800; color:var(--accent); }
  .job .jlab .tplnm { color:var(--accent-5); }   
  .job .jlab .tplmut { color:var(--mut); }   
  .job .jlab .post { color:var(--bias-l1); }     
  .job .jlab .reels { color:var(--accent-4); }   
  .job .jlab .jno { color:rgba(255,255,255,.5); }   
  .job .jlab .jai { color:var(--fg); }              
  .job .jvar { color:var(--fg); font-weight:400; }   
  .job .jvars { flex-basis:100%; display:flex; flex-direction:column; align-items:flex-start; gap:3px; margin-top:2px; padding-left:0; margin-bottom:3px; }   
  .job .jvars .jvar { display:inline-flex; align-items:center; gap:9px; }
  .job .jvars .jvar.on .jvar-tx { cursor:pointer; border-bottom:1px dashed rgba(255,255,255,.26); transition:color var(--dur), border-color var(--dur); }
  .job .jvars .jvar.on .jvar-tx:hover { color:var(--accent); border-color:var(--accent); }
  .job .jvar-dl { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; color:rgba(255,255,255,.72); background:rgba(255,255,255,.06); border:1px solid var(--line); border-radius:8px; text-decoration:none; transition:transform var(--dur-fast), background var(--dur), color var(--dur); }   
  .job .jvar-dl:hover { background:rgba(255,255,255,.15); color:var(--fg); }
  .job .jvar-dl:active svg { transform:scale(var(--press-xs,.82)); }   
  .job .jvar-dl svg { display:block; width:12px; height:12px; transition:transform var(--dur-fast) ease; }
  .job .jst { margin-left:auto; color:var(--mut); white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }   
  .job .jst svg { display:block; width:14px; height:14px; flex:none; }
  .job .jst .jspin { animation:thspin .9s linear infinite; }
  @keyframes thspin { to { transform:rotate(360deg); } }
  .thfocus { animation:thfocus 2.2s ease both; border-radius:10px; }   
  @keyframes thfocus { 0%,100%{ box-shadow:0 0 0 0 rgba(var(--accent-rgb),0); } 18%,46%{ box-shadow:0 0 0 3px rgba(var(--accent-rgb),.55); } }
  @media (prefers-reduced-motion:reduce){ .thfocus { animation:none; } .job .jst .jspin { animation:none; } }   
  .job .jst .jsec { color:var(--fg); font-variant-numeric:tabular-nums; }   
  .job .jst .nm-shim { font-size:inherit; font-weight:inherit; line-height:inherit; transform:none;
    animation:none; color:var(--mut); -webkit-text-fill-color:var(--mut); }
  .job .jst .nm-shim .jsec { -webkit-text-fill-color:var(--fg); }
  .job.job-go { cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast), background var(--dur), border-color var(--dur); }
  .job.job-go:hover { background:rgba(var(--accent-rgb),.08); border-color:rgba(var(--accent-rgb),.34); }
  .job.job-go:active { transform:scale(var(--press-l)); }
  .job.err { border-color:rgba(var(--danger-rgb),.4); } .job.err .jst { color:var(--danger); }
  .job.err .jst { white-space:normal; text-align:right; min-width:0; }   
  .job .jretry { flex:none; display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:10.5px; line-height:1; color:var(--danger); cursor:pointer; white-space:nowrap; background:rgba(40,12,12,.5); border:1px solid rgba(var(--danger-rgb),.36); border-radius:999px; padding:6px 11px; backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur); }
  .job .jretry:hover { background:rgba(var(--danger-rgb),.2); color:var(--fg); border-color:rgba(var(--danger-rgb),.6); }
  .job .jretry:active { transform:scale(var(--press-l,.95)); }
  .job .jretry svg { display:block; width:12px; height:12px; }
  .job .jretry[disabled] { opacity:.5; pointer-events:none; }
  .job .jmore { color:var(--accent); background:rgba(var(--accent-rgb),.08); border-color:rgba(var(--accent-rgb),.34); }   
  .job .jmore:hover { background:rgba(var(--accent-rgb),.18); color:var(--fg); border-color:rgba(var(--accent-rgb),.6); }
  .job .jdel { flex:none; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; color:rgba(255,255,255,.6); cursor:pointer; background:rgba(255,255,255,.05); border:1px solid var(--line); border-radius:8px; transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur); }
  .job .jdel:hover { background:rgba(var(--danger-rgb),.18); color:var(--danger); border-color:rgba(var(--danger-rgb),.5); }
  .job .jdel:active { transform:scale(var(--press-s,.85)); }
  .job .jdel svg { display:block; width:14px; height:14px; }
  .job .jdel.arm { background:rgba(var(--arm-rgb),.16); color:var(--arm); border-color:rgba(var(--arm-rgb),.55); }
  .job .jdel.ok { background:var(--accent); color:var(--on-accent); border-color:var(--accent); }
  .job .jsave-row { flex-basis:100%; display:flex; justify-content:flex-end; align-items:center; gap:var(--sp-1); margin-top:4px;  }   
  .job .jsave-row .jdesc { margin-right:auto; }   
  .job .jgrid { flex-basis:100%; display:flex; align-items:flex-start; gap:8px; margin-top:2px; }   
  .job .jgrid .jvars { flex:1 1 auto; margin-top:0; }     
  .job .jsave-row .imgedit { position:static; }   
  .job .jtasks .jtask { gap:5px;  transition:color var(--dur); }
  .job .jtask .jtask-ic { display:inline-flex; flex:none; }
  .job .jtask .jtask-ic svg, .job .jtask .jtask-ic .nm-orb { display:block; width:12px; height:12px;  }
  .job .jtask.wait { color:var(--mut); }
  .job .jtask.ok { color:var(--mut); }
  .job .jtask.ok .jtask-tx { text-decoration:line-through; text-decoration-thickness:1px; }
  .job .jtask.ok .jtask-ic { color:var(--accent); }
  .job .jtask.err { color:var(--danger); }
  .job .jtask.tkin { animation:ppbtn-in .26s both cubic-bezier(.2,.8,.3,1); animation-delay:calc(.02s + var(--i, 0) * .03s); }
  .job .jtask .jtask-ic.pop { animation:dlChkPop .42s var(--ease); }
  @media (prefers-reduced-motion:reduce){ .job .jtask.tkin, .job .jtask .jtask-ic.pop { animation:none; } }
  .job .jgrid .jsave-row { flex:0 0 auto; margin-top:1px; }`,"nm-clip.css":`.iobtn { position:absolute; top:8px; right:8px; width:30px; height:30px; display:grid; place-items:center; padding:0; color:var(--mut); background:rgba(255,255,255,.06); border:1px solid var(--line); border-radius:9px; cursor:pointer; z-index:2; transition:transform .12s, background .15s, color .15s, border-color .15s; -webkit-backdrop-filter:blur(var(--blur-s)); backdrop-filter:blur(var(--blur-s)); -webkit-tap-highlight-color:transparent; }
.iobtn:hover { background:rgba(255,255,255,.12); color:var(--fg); }
.iobtn:active { transform:scale(var(--press-s,.85)); }
.iobtn.ok { background:var(--accent); color:var(--on-accent); border-color:var(--accent); }
.iobtn svg { display:block; }
.iobtn-edge, .scnclip, .urlclip, .askclip {
  --clip-x:28%; position:absolute; top:0; right:calc(var(--clip-x) + 14px); transform:translateY(-50%);
  display:grid; place-items:center; width:26px; height:26px; padding:0; z-index:5; opacity:.6; border-radius:50%;
  background:rgba(26,28,26,.3); border:1px solid rgba(255,255,255,.17); color:var(--mut); cursor:pointer;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.2); -webkit-tap-highlight-color:transparent;
  transition:transform var(--dur-fast), color var(--dur), border-color var(--dur); }   
:is(.iowrap, .scnwrap, .urlwrap, .edwrap) > :is(.iobtn-edge, .scnclip, .urlclip) { --clip-plate:var(--well, var(--bg)); opacity:1; background:var(--clip-plate); border-color:var(--line); -webkit-backdrop-filter:none; backdrop-filter:none; }
:is(.iowrap, .scnwrap, .urlwrap, .edwrap) > :is(.iobtn-edge, .scnclip, .urlclip):is(.ok, .iobtn-off, .scn-off, .url-off) { opacity:1; background:var(--clip-plate); border-color:var(--line); }   
nd-html.modern-workspace :is(.iowrap, .scnwrap, .urlwrap, .edwrap) > :is(.iobtn-edge, .scnclip, .urlclip) { --clip-plate:linear-gradient(var(--modern-well), var(--modern-well)), linear-gradient(var(--modern-control-glass), var(--modern-control-glass)), var(--modern-page); box-shadow:var(--modern-panel-inset); }
.iobtn-edge svg, .scnclip svg, .urlclip svg, .askclip svg { display:block; width:13px; height:13px; }
:is(.iowrap, .scnwrap, .urlwrap, .edwrap) > :is(.iobtn-edge, .scnclip, .urlclip) svg { opacity:.6; }   
:is(.iowrap, .scnwrap, .urlwrap, .edwrap) > :is(.iobtn-off, .scn-off, .url-off) svg { opacity:.3; }   
.scnclip::before, .urlclip::before { content:""; position:absolute; inset:-8px; }   
.iobtn-edge:hover, .scnclip:hover, .urlclip:hover, .askclip:hover { color:var(--fg); border-color:rgba(255,255,255,.27); }
.iobtn-edge:active, .scnclip:active, .urlclip:active, .askclip:active { transform:translateY(-50%) scale(var(--press-s,.85)); color:var(--accent); border-color:rgba(var(--accent-rgb),.6); }
.iobtn-edge.ok, .scnclip.ok, .urlclip.ok, .askclip.ok { background:rgba(26,28,26,.3); color:var(--accent); border-color:rgba(255,255,255,.17); }
.iobtn-pp, .scn-pp, .url-pp, .ask-pp { right:calc(var(--clip-x,0px) + 46px); }        
.iobtn-erase, .scn-erase, .url-erase, .ask-erase { right:calc(var(--clip-x,0px) + 14px); }   
.iobtn-copy { right:calc(var(--clip-x,0px) + 46px); }   
.iobtn-copy-e, .scn-copy, .url-cp, .ask-cp { right:calc(var(--clip-x,0px) + 78px); }  
.iobtn-off, .scn-erase.scn-off, .url-erase.url-off, .ask-off { opacity:.3; pointer-events:none; }   
.iobtn-edge.iobtn-undo, .scn-erase.scn-undo, .url-erase.url-undo, .ask-undo { color:var(--fg); border-color:rgba(255,255,255,.34); }   
.iobtn-hide, .scn-hide, .url-hide, .ask-cphide { display:none; }   
:is(.iowrap, .scnwrap, .urlwrap):has(> :is(input, textarea)[hidden]) > :is(.iobtn-edge, .scnclip, .urlclip),
:is(.iobtn-edge, .scnclip, .urlclip, .askclip)[hidden] { display:none; }
.pastefb { border:none; outline:none; background:transparent; max-width:100cqw; max-height:100cqh; width:auto; padding:0; margin:auto; }
.pastefb::backdrop { background:rgba(0,0,0,.55); -webkit-backdrop-filter:blur(var(--blur-s)); backdrop-filter:blur(var(--blur-s)); }
.pastefb-box { width:min(360px,90cqw); background:linear-gradient(165deg,#14160f,#0c0f0c); border:1px solid var(--line); border-radius:16px; padding:16px; display:flex; flex-direction:column; gap:12px; box-shadow:0 16px 48px rgba(0,0,0,.55); }
.pastefb-msg { font-size:13px; color:var(--mut); line-height:1.5; } .pastefb-msg b { color:var(--accent); }
.pastefb-ta { width:100%; box-sizing:border-box; min-height:90px; resize:none; padding:10px 12px; border:1px solid var(--line); border-radius:10px; background:rgba(255,255,255,.05); color:var(--fg); font:inherit; font-size:14px; }
.pastefb-ta:focus { border-color:rgba(var(--accent-rgb),.4); outline:none; }
.pastefb-row { display:flex; gap:8px; justify-content:flex-end; }
.pastefb-btn { padding:8px 16px; border-radius:999px; border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--mut); font:inherit; font-size:13px; font-weight:700; cursor:pointer; }
.pastefb-ok { color:var(--accent); border-color:rgba(var(--accent-rgb),.4); background:rgba(var(--accent-rgb),.1); }`,"nm-input.css":`.nmin {
  width:100%; padding:var(--sp-2) ; background:rgba(14,15,17,.55) ; border:1px solid var(--line); border-radius:var(--r-s);
  color:var(--fg); font:inherit; font-size:90%; letter-spacing:inherit;
}   
.nmin { border-color:rgba(var(--accent-rgb),.35); box-shadow:0 0 0 3px rgba(var(--accent-rgb),.08); }   
.nmin:focus { border-color:rgba(var(--accent-rgb),.6) ; box-shadow:0 0 0 3px rgba(var(--accent-rgb),.08); outline:none; }
.nmin::placeholder { color:var(--mut); }
textarea.nmin { min-height:104px; resize:none; }`,"nm-scene-tokens.css":`.nd-root {
  --space-bg: #070a12;
  --space-hi-rgb: 26,47,102;
  --bias-l1: #38C6FF;
  --bias-l2: #3a6ddb;
}`,"nm-scene.css":`nd-html.nm-scene-ready:not(:has(#wavebg)) {
  background:var(--space-bg);
}
nd-html.nm-scene-ready:not(:has(#wavebg)) nd-body {
  background:transparent !important;
}
nd-html.nm-scene-ready:not(:has(#wavebg)) nd-body::before {
  display:none;
}
.nm-scene-canvas {
  position:fixed;
  inset:0;
  z-index:-1;
  pointer-events:none;
  display:block;
  width:100%;
  height:100%;
}
.nm-scene-canvas.off {
  display:none;
}`},a="@font-face{font-family:'Pretendard Variable';font-weight:45 920;font-style:normal;font-display:swap;src:local('Pretendard Variable'),url(/assets/fonts/pretendard.woff2) format('woff2-variations')}";export{a as FONTS,r as SHEETS};
