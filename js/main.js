// Application state
let currentLanguage = 'en';
let portfolioData = null;

// Inline SVG icons for overview cards (keyed by data.json "icon" field)
const ICONS = {
    backend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0-.42-8.98 6 6 0 1 0-11.05 3.1A3.5 3.5 0 0 0 6.5 19h11z"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><rect x="5" y="6" width="14" height="12" rx="3"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/><path d="M2 12h3M19 12h3"/></svg>',
    agent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>',
    quality: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>'
};

// Inline SVG cover art for project cards (keyed by data.json "art" field).
// Every cover shares one atmosphere — a soft aurora in the project's brand
// hue, bloom on the bright strokes, film grain and a bottom fade — so the set
// reads as one family. Motion classes (cv-*) live in main.css.
const coverBase = (id, hue, x = 30, y = 0) => `
        <defs>
            <radialGradient id="${id}-glow" cx="${x}%" cy="${y}%" r="85%">
                <stop offset="0%" stop-color="${hue}" stop-opacity=".3"/>
                <stop offset="55%" stop-color="${hue}" stop-opacity=".06"/>
                <stop offset="100%" stop-color="${hue}" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset=".45" stop-color="#0c0a09" stop-opacity="0"/>
                <stop offset="1" stop-color="#0c0a09" stop-opacity=".6"/>
            </linearGradient>
            <linearGradient id="${id}-glass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="${hue}" stop-opacity=".22"/>
                <stop offset="1" stop-color="${hue}" stop-opacity=".03"/>
            </linearGradient>
            <filter id="${id}-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.6" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="${id}-haze" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
            <filter id="${id}-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .14 0"/></filter>
        </defs>
        <rect width="400" height="140" fill="url(#${id}-glow)"/>`;

const coverFinish = id => `
        <rect width="400" height="140" fill="url(#${id}-fade)"/>
        <rect width="400" height="140" filter="url(#${id}-grain)" opacity=".5"/>`;

// Receding floor grid that sells depth under a scene
const coverFloor = (hue, horizon = 92) => {
    const rows = [0, 6, 14, 25, 40].map(d => `M0 ${horizon + d}H400`).join('');
    const cols = [-200, -100, -20, 60, 140, 200, 260, 340, 420, 500, 600]
        .map(x => `M200 ${horizon - 30}L${x} 170`).join('');
    return `<g stroke="${hue}" stroke-width=".8" fill="none" opacity=".16"><path d="${rows}"/><path d="${cols}" opacity=".7"/></g>`;
};

const starPath = (cx, cy, r) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? r * 0.42 : r;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts.join('L')}Z`;
};

const sparkle = (x, y, s, hue) =>
    `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="${hue}"/>`;

const COVERS = {
    // ShadowLytics — topographic terrain in perspective, a glowing route of
    // analysis nodes across it, and a Lambda cube executing above one (amber)
    geo: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cg', '#f59e0b', 62, 0)}
        <circle cx="250" cy="40" r="60" fill="#f59e0b" opacity=".18" filter="url(#cg-haze)"/>
        <g fill="none" stroke="#f59e0b" stroke-width="1.2">
            <g transform="translate(262 100) scale(1 .36)" opacity=".5">
                <circle r="22"/><circle r="44" opacity=".8"/><circle r="68" opacity=".6"/><circle r="94" opacity=".45"/><circle r="122" opacity=".3"/><circle r="152" opacity=".18"/>
            </g>
            <g transform="translate(70 124) scale(1 .3)" opacity=".35">
                <circle r="26"/><circle r="52" opacity=".7"/><circle r="80" opacity=".45"/>
            </g>
        </g>
        <path d="M48 96 104 58l56 30 62-38 60 34 56-28 32 18" fill="none" stroke="#fbbf24" stroke-opacity=".25" stroke-width="5" filter="url(#cg-haze)"/>
        <path d="M48 96 104 58l56 30 62-38 60 34 56-28 32 18" fill="none" stroke="#fbbf24" stroke-width="1.6" stroke-opacity=".9" class="cv-flow" filter="url(#cg-bloom)"/>
        <g stroke="#f59e0b" stroke-opacity=".55" stroke-dasharray="2 3"><path d="M222 50V30"/></g>
        <g class="cv-float"><g transform="translate(222 18)">
            <path d="M0-10 11-4 0 2-11-4Z" fill="#fde68a" fill-opacity=".55"/>
            <path d="M-11-4 0 2v12l-11-6Z" fill="#f59e0b" fill-opacity=".45"/>
            <path d="M11-4 0 2v12l11-6Z" fill="#b45309" fill-opacity=".55"/>
            <path d="M0-10 11-4v12L0 14-11 8V-4Z" fill="none" stroke="#fde68a" stroke-width="1" stroke-opacity=".8"/>
        </g></g>
        <g filter="url(#cg-bloom)" fill="#f59e0b">
            <circle cx="48" cy="96" r="5"/><circle cx="104" cy="58" r="7" fill="#fbbf24"/><circle cx="160" cy="88" r="4.5"/>
            <circle cx="222" cy="50" r="6.5" fill="#fde68a"/><circle cx="282" cy="84" r="5"/><circle cx="338" cy="56" r="7" fill="#fbbf24"/><circle cx="370" cy="74" r="3.5" opacity=".7"/>
        </g>
        <g fill="none" stroke="#fbbf24" stroke-width="1.4">
            <circle cx="104" cy="58" r="7" class="cv-pulse"/><circle cx="338" cy="56" r="7" class="cv-pulse cv-delay"/>
        </g>${coverFinish('cg')}
    </svg>`,

    // Agent skills plugin — a glass terminal whose prompt fans out into
    // skill capsules, work flowing along the threads (violet)
    skills: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cs', '#c084fc', 25, 10)}
        ${coverFloor('#c084fc', 108)}
        <circle cx="110" cy="66" r="48" fill="#a78bfa" opacity=".3" filter="url(#cs-haze)"/>
        <circle cx="330" cy="70" r="40" fill="#e879f9" opacity=".14" filter="url(#cs-haze)"/>
        <g fill="none" stroke="#c4b5fd" stroke-width="1.4" stroke-opacity=".35">
            <path d="M186 70C236 70 236 30 286 30M186 70H286M186 70C236 70 236 110 286 110"/>
        </g>
        <g fill="none" stroke="#e9d5ff" stroke-width="1.8" class="cv-flow" filter="url(#cs-bloom)">
            <path d="M186 70C236 70 236 30 286 30"/><path d="M186 70H286"/><path d="M186 70C236 70 236 110 286 110"/>
        </g>
        <g class="cv-float">
            <rect x="36" y="24" width="150" height="92" rx="10" fill="url(#cs-glass)" stroke="#c4b5fd" stroke-opacity=".75" stroke-width="1.4"/>
            <rect x="36.7" y="24.7" width="148.6" height="17" rx="9" fill="#c084fc" fill-opacity=".1"/>
            <g fill="#c4b5fd"><circle cx="48" cy="33" r="2.6" opacity=".9"/><circle cx="57" cy="33" r="2.6" opacity=".6"/><circle cx="66" cy="33" r="2.6" opacity=".35"/></g>
            <path d="M50 56l7 5-7 5" fill="none" stroke="#f0abfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="url(#cs-bloom)"/>
            <path d="M64 61h22" stroke="#e9d5ff" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M92 61h30" stroke="#c4b5fd" stroke-width="2.2" stroke-linecap="round" stroke-opacity=".7"/>
            <rect x="127" y="54" width="6" height="13" rx="1" fill="#f0abfc" class="cv-blink"/>
            <path d="M50 80h46M102 80h26M50 94h28M84 94h50" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round" stroke-opacity=".3"/>
        </g>
        ${sparkle(176, 18, 6, '#f5d0fe')}${sparkle(196, 36, 3, '#e9d5ff')}
        <g stroke-width="1.4">
            <rect x="286" y="18" width="84" height="24" rx="12" fill="url(#cs-glass)" stroke="#e9d5ff" stroke-opacity=".9"/>
            <rect x="286" y="58" width="84" height="24" rx="12" fill="url(#cs-glass)" stroke="#c4b5fd" stroke-opacity=".7"/>
            <rect x="286" y="98" width="84" height="24" rx="12" fill="url(#cs-glass)" stroke="#c4b5fd" stroke-opacity=".5"/>
        </g>
        <g filter="url(#cs-bloom)">
            <circle cx="300" cy="30" r="4" fill="#f0abfc"/><circle cx="300" cy="70" r="4" fill="#c084fc"/><circle cx="300" cy="110" r="4" fill="#a78bfa"/>
        </g>
        <path d="M312 30h40M312 70h30M312 110h44" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round" stroke-opacity=".45"/>${coverFinish('cs')}
    </svg>`,

    // SequenceStack — a workflow that splits and merges, the AI step glowing
    // brightest, work flowing through it over a receding grid (indigo)
    workflow: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cw', '#818cf8', 45, 0)}
        ${coverFloor('#818cf8', 104)}
        <circle cx="170" cy="70" r="46" fill="#818cf8" opacity=".35" filter="url(#cw-haze)"/>
        <g fill="none" stroke="#a5b4fc" stroke-width="1.6" stroke-opacity=".35" stroke-linecap="round" stroke-linejoin="round">
            <path d="M30 70h22M112 70h28M200 70h14q8 0 8-8v-10q0-8 8-8h2M200 70h14q8 0 8 8v10q0 8 8 8h2M292 44h12q8 0 8 8v10q0 8 8 8h4M292 96h12q8 0 8-8v-10q0-8 8-8"/>
        </g>
        <g fill="none" stroke="#e0e7ff" stroke-width="1.8" stroke-linecap="round" class="cv-flow" filter="url(#cw-bloom)">
            <path d="M30 70h22M112 70h28M200 70h14q8 0 8-8v-10q0-8 8-8h2M292 44h12q8 0 8 8v10q0 8 8 8h4"/>
            <path d="M200 70h14q8 0 8 8v10q0 8 8 8h2M292 96h12q8 0 8-8v-10q0-8 8-8"/>
        </g>
        <g stroke-width="1.4">
            <rect x="52" y="54" width="60" height="32" rx="9" fill="url(#cw-glass)" stroke="#a5b4fc" stroke-opacity=".7"/>
            <rect x="232" y="28" width="60" height="32" rx="9" fill="url(#cw-glass)" stroke="#a5b4fc" stroke-opacity=".7"/>
            <rect x="232" y="80" width="60" height="32" rx="9" fill="url(#cw-glass)" stroke="#a5b4fc" stroke-opacity=".55"/>
            <rect x="140" y="50" width="60" height="40" rx="11" fill="url(#cw-glass)" stroke="#e0e7ff" stroke-opacity=".95" filter="url(#cw-bloom)"/>
        </g>
        <g fill="#c7d2fe" opacity=".6"><rect x="62" y="65" width="26" height="4" rx="2"/><rect x="62" y="72" width="38" height="4" rx="2" opacity=".6"/>
            <rect x="242" y="39" width="22" height="4" rx="2"/><rect x="242" y="46" width="36" height="4" rx="2" opacity=".6"/>
            <rect x="242" y="91" width="30" height="4" rx="2"/><rect x="242" y="98" width="20" height="4" rx="2" opacity=".6"/></g>
        <g filter="url(#cw-bloom)">${sparkle(170, 70, 10, '#eef2ff')}${sparkle(186, 58, 4, '#c7d2fe')}</g>
        <circle cx="30" cy="70" r="4.5" fill="#c7d2fe" filter="url(#cw-bloom)"/>
        <circle cx="336" cy="70" r="9" fill="none" stroke="#c7d2fe" stroke-width="1.6"/>
        <circle cx="336" cy="70" r="3.5" fill="#eef2ff" filter="url(#cw-bloom)"/>
        <circle cx="336" cy="70" r="9" fill="none" stroke="#c7d2fe" stroke-width="1.4" class="cv-pulse"/>${coverFinish('cw')}
    </svg>`,

    // Clavalo — a night pitch in perspective, a ball hovering over the
    // centre circle and a bracket rising as light beams (teal)
    pitch: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cp', '#2dd4bf', 50, 0)}
        <path d="M120 44H280L460 150H-60Z" fill="#14b8a6" fill-opacity=".06"/>
        <g fill="none" stroke="#5eead4" stroke-width="1.2" stroke-opacity=".45">
            <path d="M120 44H280L460 150H-60Z"/>
            <path d="M200 44V150" stroke-opacity=".35"/>
            <ellipse cx="200" cy="82" rx="54" ry="15"/>
            <path d="M168 44v8h64v-8" stroke-opacity=".35"/>
        </g>
        <g stroke="#5eead4" stroke-opacity=".08" stroke-width="10"><path d="M150 44 60 150M190 44l-30 106M230 44l40 106M270 44l90 106"/></g>
        <circle cx="200" cy="40" r="70" fill="#2dd4bf" opacity=".14" filter="url(#cp-haze)"/>
        <ellipse cx="200" cy="86" rx="22" ry="4.5" fill="#000" opacity=".45" filter="url(#cp-bloom)"/>
        <g class="cv-float">
            <circle cx="200" cy="56" r="17" fill="#0f766e" fill-opacity=".35" stroke="#99f6e4" stroke-width="1.6" filter="url(#cp-bloom)"/>
            <path d="M200 49l6.6 4.8-2.5 7.8h-8.2l-2.5-7.8Z" fill="#5eead4"/>
            <path d="M200 49v-8M206.6 53.8l9-2.6M204.1 61.6l5.2 7M195.9 61.6l-5.2 7M193.4 53.8l-9-2.6" stroke="#99f6e4" stroke-width="1.3" stroke-opacity=".8"/>
        </g>
        <g fill="none" stroke="#5eead4" stroke-width="1.4" stroke-linecap="round" filter="url(#cp-bloom)" stroke-opacity=".8">
            <path d="M300 26h18v18h-18M300 62h18v-18M318 35h16M300 82h18v18h-18M300 118h18v-18M318 91h16M334 35v28h16M334 91v-28"/>
        </g>
        <path d="M350 63h12" stroke="#ccfbf1" stroke-width="1.8" class="cv-flow"/>
        <circle cx="366" cy="63" r="5" fill="#ccfbf1" filter="url(#cp-bloom)"/>
        <circle cx="366" cy="63" r="5" fill="none" stroke="#5eead4" stroke-width="1.4" class="cv-pulse"/>
        <g fill="none" stroke="#5eead4" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".5">
            <path d="M82 26H100v18H82M82 62h18v-18M100 35h-16M82 82h18v18H82M82 118h18v-18M100 91H84" transform="matrix(-1 0 0 1 182 0)"/>
        </g>${coverFinish('cp')}
    </svg>`,

    // Everlast — two frosted chat bubbles (coach and member) with a
    // heartbeat travelling between them (teal + warm cream)
    chat: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cc', '#2dd4bf', 20, 10)}
        <defs><linearGradient id="cc-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a" stop-opacity=".24"/><stop offset="1" stop-color="#fde68a" stop-opacity=".04"/></linearGradient></defs>
        <circle cx="110" cy="46" r="46" fill="#2dd4bf" opacity=".26" filter="url(#cc-haze)"/>
        <circle cx="290" cy="96" r="46" fill="#fbbf24" opacity=".18" filter="url(#cc-haze)"/>
        <path d="M0 72H176l7-16 9 34 9-46 9 40 6-12H350l7-16 9 34 9-46 9 40 6-12H400" fill="none" stroke="#5eead4" stroke-width="1.2" stroke-opacity=".2"/>
        <path d="M0 72H176l7-16 9 34 9-46 9 40 6-12H350l7-16 9 34 9-46 9 40 6-12H400" fill="none" stroke="#ccfbf1" stroke-width="1.8" class="cv-beat" filter="url(#cc-bloom)"/>
        <g class="cv-float">
            <path d="M74 18h82a20 20 0 0 1 0 40H96l-14 10 2-10h-10a20 20 0 0 1 0-40Z" fill="none" stroke="#5eead4" stroke-width="1.4" stroke-opacity=".85"/>
            <path d="M74 18h82a20 20 0 0 1 0 40H96l-14 10 2-10h-10a20 20 0 0 1 0-40Z" fill="url(#cc-glass)"/>
            <g fill="#99f6e4" filter="url(#cc-bloom)"><circle cx="98" cy="38" r="4" class="cv-blink"/><circle cx="115" cy="38" r="4" class="cv-blink cv-delay"/><circle cx="132" cy="38" r="4" class="cv-blink cv-delay-2"/></g>
        </g>
        <g class="cv-float cv-delay">
            <path d="M244 80h82a20 20 0 0 1 0 40h-10l2 10-14-10H244a20 20 0 0 1 0-40Z" fill="url(#cc-cream)" stroke="#fde68a" stroke-width="1.4" stroke-opacity=".85"/>
            <path d="M268 94c-4-5-12-2-10 5 1 4 10 9 10 9s9-5 10-9c2-7-6-10-10-5Z" fill="#fde68a" filter="url(#cc-bloom)"/>
            <path d="M286 96h28M286 105h18" stroke="#fde68a" stroke-width="2.4" stroke-linecap="round" stroke-opacity=".5"/>
        </g>${coverFinish('cc')}
    </svg>`,

    // Patriotlink — a glass shield with three stars, flag ribbons waving
    // behind it (blue + red)
    flag: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cf', '#60a5fa', 22, 10)}
        <defs><linearGradient id="cf-ribbon" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
            <mask id="cf-fadeX"><rect width="400" height="140" fill="url(#cf-ribbon)"/></mask></defs>
        <circle cx="300" cy="70" r="60" fill="#e5484d" opacity=".12" filter="url(#cf-haze)"/>
        <g fill="none" stroke-linecap="round" mask="url(#cf-fadeX)" class="cv-wave">
            <path d="M60 34C140 14 200 54 280 34S380 22 420 30" stroke="#e5484d" stroke-width="7" stroke-opacity=".35"/>
            <path d="M60 52C140 32 200 72 280 52S380 40 420 48" stroke="#f1f5f9" stroke-width="5" stroke-opacity=".18"/>
            <path d="M60 70C140 50 200 90 280 70S380 58 420 66" stroke="#e5484d" stroke-width="7" stroke-opacity=".3"/>
            <path d="M60 88C140 68 200 108 280 88S380 76 420 84" stroke="#f1f5f9" stroke-width="5" stroke-opacity=".14"/>
            <path d="M60 106C140 86 200 126 280 106S380 94 420 102" stroke="#60a5fa" stroke-width="7" stroke-opacity=".3"/>
        </g>
        <circle cx="96" cy="66" r="44" fill="#3b82f6" opacity=".35" filter="url(#cf-haze)"/>
        <path d="M96 16 132 28v34c0 24-16 40-36 48-20-8-36-24-36-48V28Z" fill="url(#cf-glass)" stroke="#bfdbfe" stroke-width="1.6" filter="url(#cf-bloom)"/>
        <path d="M96 24 125 34v28c0 19-12 32-29 39-17-7-29-20-29-39V34Z" fill="none" stroke="#60a5fa" stroke-opacity=".4"/>
        <g fill="#f8fafc" filter="url(#cf-bloom)"><path d="${starPath(84, 46, 7)}"/><path d="${starPath(108, 46, 7)}"/><path d="${starPath(96, 64, 7)}"/></g>
        <path d="M78 82h36M82 90h28" stroke="#e5484d" stroke-width="2.4" stroke-linecap="round" stroke-opacity=".85"/>
        ${sparkle(170, 22, 4, '#bfdbfe')}${sparkle(352, 118, 3, '#bfdbfe')}${sparkle(330, 20, 3, '#fecaca')}${coverFinish('cf')}
    </svg>`,

    // IBIDS — the ibiDs.io robot head beside glass bars rising into a
    // glowing bid trend (green)
    bids: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${coverBase('cb', '#4ade80', 25, 0)}
        ${coverFloor('#4ade80', 126)}
        <circle cx="100" cy="64" r="44" fill="#22c55e" opacity=".3" filter="url(#cb-haze)"/>
        <g class="cv-float"><g transform="translate(70 24)">
            <path d="M30 30V14" stroke="#86efac" stroke-width="1.6"/>
            <circle cx="30" cy="10" r="5" fill="#bbf7d0" filter="url(#cb-bloom)"/>
            <circle cx="30" cy="10" r="5" fill="none" stroke="#4ade80" stroke-width="1.4" class="cv-pulse"/>
            <rect x="-10" y="30" width="80" height="58" rx="16" fill="url(#cb-glass)" stroke="#86efac" stroke-width="1.6" filter="url(#cb-bloom)"/>
            <rect x="-19" y="47" width="9" height="24" rx="4" fill="#4ade80" fill-opacity=".15" stroke="#4ade80" stroke-opacity=".6"/>
            <rect x="70" y="47" width="9" height="24" rx="4" fill="#4ade80" fill-opacity=".15" stroke="#4ade80" stroke-opacity=".6"/>
            <rect x="2" y="42" width="56" height="26" rx="10" fill="#052e16" fill-opacity=".6"/>
            <g fill="#bbf7d0" filter="url(#cb-bloom)"><circle cx="16" cy="55" r="5" class="cv-blink-slow"/><circle cx="44" cy="55" r="5" class="cv-blink-slow"/></g>
            <path d="M18 78q12 6 24 0" stroke="#86efac" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g></g>
        <defs><linearGradient id="cb-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80" stop-opacity=".6"/><stop offset="1" stop-color="#4ade80" stop-opacity=".02"/></linearGradient></defs>
        <g fill="url(#cb-bar)" stroke="#86efac" stroke-opacity=".35">
            <rect x="214" y="92" width="20" height="40" rx="4"/><rect x="246" y="74" width="20" height="58" rx="4"/>
            <rect x="278" y="84" width="20" height="48" rx="4"/><rect x="310" y="56" width="20" height="76" rx="4"/><rect x="342" y="40" width="20" height="92" rx="4"/>
        </g>
        <path d="M224 84 256 64l32 10 32-28 32-16" fill="none" stroke="#bbf7d0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="url(#cb-bloom)"/>
        <g fill="#dcfce7" filter="url(#cb-bloom)"><circle cx="224" cy="84" r="2.6"/><circle cx="256" cy="64" r="2.6"/><circle cx="288" cy="74" r="2.6"/><circle cx="320" cy="46" r="2.6"/><circle cx="352" cy="30" r="4"/></g>
        <circle cx="352" cy="30" r="4" fill="none" stroke="#4ade80" stroke-width="1.4" class="cv-pulse cv-delay"/>${coverFinish('cb')}
    </svg>`
};

// Load data and initialize application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadPortfolioData();
        initializeApp();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Fallback to static content if JSON fails to load
        initializeBasicFeatures();
    }
});

// Load portfolio data — embedded js/data.js works over file:// and HTTP alike;
// fetch of data.json is the fallback if the script tag was removed.
async function loadPortfolioData() {
    if (window.PORTFOLIO_DATA) {
        portfolioData = window.PORTFOLIO_DATA;
    } else {
        const response = await fetch('./data.json');
        portfolioData = await response.json();
    }
    return portfolioData;
}

// Initialize all app features
function initializeApp() {
    renderContent();
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeScrollReveal();
    initializeScrollSpy();
    initializeScrollProgress();
    initializeTypewriter();
    initializeCounters();
    initializeCardSpotlight();
    initializeLocalClock();
    updateFooterYear();
}

// Live HH:MM clock for Buenos Aires (UTC-3) in the timezone card
function initializeLocalClock() {
    const clock = document.querySelector('[data-clock]');
    if (!clock) return;

    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    function update() {
        clock.textContent = formatter.format(new Date());
    }

    update();
    setInterval(update, 15000);
}

// Cards get a radial glow that follows the cursor (via --mx/--my CSS vars)
function initializeCardSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.overview-card, .project-card, .skill-category');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, { passive: true });
}

// Initialize basic features without JSON data
function initializeBasicFeatures() {
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeScrollReveal();
    updateFooterYear();
}

// Render all content from JSON data
function renderContent() {
    if (!portfolioData) return;

    renderNavigation();
    renderHeroSection();
    renderOverviewSection();
    renderExperienceSection();
    renderProjectsSection();
    renderSkillsSection();
    renderContactSection();
}

// Render header navigation links
function renderNavigation() {
    const navContainer = document.querySelector('[data-nav-links]');
    const links = portfolioData.navigation.links;
    if (!navContainer || !links) return;

    navContainer.innerHTML = Object.entries(links).map(([sectionId, label]) => `
        <a href="#${sectionId}" class="nav-link" data-section="${sectionId}" data-text='${JSON.stringify(label)}'>${getText(label)}</a>
    `).join('');
}

// Render hero section
function renderHeroSection() {
    const data = portfolioData.personal;

    updateElement('[data-hero-title]', data.name);
    updateBilingualElement('[data-hero-subtitle]', data.title);
    updateBilingualElement('[data-hero-description]', data.description);

    const statsContainer = document.querySelector('[data-hero-stats]');
    if (statsContainer && portfolioData.stats) {
        statsContainer.innerHTML = portfolioData.stats.map(stat => `
            <div class="stat">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label" data-text='${JSON.stringify(stat.label)}'>${getText(stat.label)}</span>
            </div>
        `).join('');
    }
}

// Render overview section
function renderOverviewSection() {
    const data = portfolioData.overview;

    updateBilingualElement('[data-overview-title]', data.title);

    const cardsContainer = document.querySelector('[data-overview-cards]');
    if (cardsContainer && data.cards) {
        cardsContainer.innerHTML = data.cards.map(card => `
            <div class="overview-card">
                <div class="card-icon">${ICONS[card.icon] || ''}</div>
                <h3 data-text='${JSON.stringify(card.title)}'>${getText(card.title)}</h3>
                <p data-text='${JSON.stringify(card.description)}'>${getText(card.description)}</p>
            </div>
        `).join('');
    }
}

// Render experience section
function renderExperienceSection() {
    const data = portfolioData.experience;
    if (!data) return;

    updateBilingualElement('[data-experience-title]', data.title);

    const listContainer = document.querySelector('[data-experience-list]');
    if (listContainer && data.list) {
        listContainer.innerHTML = data.list.map(job => `
            <article class="experience-item">
                <div class="experience-meta">
                    <span class="period" data-text='${JSON.stringify(job.period)}'>${getText(job.period)}</span>
                    <span class="location" data-text='${JSON.stringify(job.location)}'>${getText(job.location)}</span>
                </div>
                <div class="experience-body">
                    <h3 data-text='${JSON.stringify(job.role)}'>${getText(job.role)}</h3>
                    <p class="company">${job.company}</p>
                    <ul>
                        ${job.highlights.map(item => `
                            <li data-text='${JSON.stringify(item)}'>${getText(item)}</li>
                        `).join('')}
                    </ul>
                </div>
            </article>
        `).join('');
    }
}

// Render projects section
function renderProjectsSection() {
    const data = portfolioData.projects;

    updateBilingualElement('[data-projects-title]', data.title);

    const projectsContainer = document.querySelector('[data-projects-list]');
    if (projectsContainer && data.list) {
        const ordered = [...data.list].sort((a, b) => (a.grade ?? 99) - (b.grade ?? 99));
        projectsContainer.innerHTML = ordered.map(project => `
            <a class="project-card ${project.featured ? 'featured' : ''}" ${project.url ? `href="${project.url}" target="_blank" rel="noopener"` : ''}>
                ${COVERS[project.art] ? `<div class="project-cover" aria-hidden="true">${COVERS[project.art]}</div>` : ''}
                <div class="project-header">
                    <h3>${project.name}
                        <svg class="project-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>
                    </h3>
                    <span class="project-type" data-text='${JSON.stringify(project.type)}'>${getText(project.type)}</span>
                </div>
                <p class="project-description" data-text='${JSON.stringify(project.description)}'>${getText(project.description)}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-impact">
                    <strong data-text='${JSON.stringify(portfolioData.navigation.labels.impact)}'>${getText(portfolioData.navigation.labels.impact)}</strong>
                    <span data-text='${JSON.stringify(project.impact)}'>${getText(project.impact)}</span>
                </div>
            </a>
        `).join('');
    }
}

// Render skills section
function renderSkillsSection() {
    const data = portfolioData.skills;

    updateBilingualElement('[data-skills-title]', data.title);

    const skillsContainer = document.querySelector('[data-skills-list]');
    if (skillsContainer && data.categories) {
        skillsContainer.innerHTML = data.categories.map(category => `
            <div class="skill-category">
                <h3 data-text='${JSON.stringify(category.title)}'>${getText(category.title)}</h3>
                <div class="skills-list">
                    ${category.skills.map(skill => `
                        <span class="skill ${skill.level}">
                            ${skill.name}
                            <span class="skill-level" aria-label="${skill.level}"><i></i><i></i><i></i></span>
                        </span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Render contact section
function renderContactSection() {
    const contactData = portfolioData.contact;
    const personalData = portfolioData.personal.contact;

    updateBilingualElement('[data-contact-title]', contactData.title);
    updateBilingualElement('[data-contact-description]', contactData.description);

    const contactInfo = document.querySelector('[data-contact-info]');
    if (contactInfo) {
        contactInfo.innerHTML = `
            <div class="contact-item">
                <span class="contact-label">Email</span>
                <div class="contact-email">
                    <a href="mailto:${personalData.email}">${personalData.email}</a>
                    <button class="copy-btn" data-copy="${personalData.email}" data-text='{"en":"copy","es":"copiar"}'>copy</button>
                </div>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='{"en":"Location","es":"Ubicación"}'>Location</span>
                <span data-text='${JSON.stringify(personalData.location)}'>${getText(personalData.location)}</span>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='{"en":"Timezone","es":"Zona Horaria"}'>Timezone</span>
                <span>${personalData.timezone} · <span class="local-clock" data-clock>--:--</span></span>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='{"en":"Availability","es":"Disponibilidad"}'>Availability</span>
                <span data-text='${JSON.stringify(personalData.availability)}'>${getText(personalData.availability)}</span>
            </div>
        `;
    }

    const contactLinks = document.querySelector('[data-contact-links]');
    if (contactLinks) {
        contactLinks.innerHTML = `
            <a href="${personalData.linkedin}" target="_blank" rel="noopener" class="button primary">
                <span data-text='${JSON.stringify(portfolioData.navigation.contact_links.linkedin)}'>${getText(portfolioData.navigation.contact_links.linkedin)}</span>
            </a>
            <a href="${personalData.github}" target="_blank" rel="noopener" class="button secondary">
                <span data-text='${JSON.stringify(portfolioData.navigation.contact_links.github)}'>${getText(portfolioData.navigation.contact_links.github)}</span>
            </a>
            <a href="cv.html" class="button secondary">
                <span data-text='{"en":"Download CV","es":"Descargar CV"}'>Download CV</span>
            </a>
        `;
    }
}

// Update footer year
function updateFooterYear() {
    const yearElement = document.querySelector('[data-year]');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Helper function to get text in current language
function getText(textObj) {
    if (typeof textObj === 'string') return textObj;
    return textObj[currentLanguage] || textObj['en'] || '';
}

// Helper function to update bilingual elements
function updateBilingualElement(selector, textObj) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = getText(textObj);
        element.setAttribute('data-text', JSON.stringify(textObj));
    }
}

// Helper function to update regular elements
function updateElement(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

// Language switcher functionality
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');

            if (selectedLang !== currentLanguage) {
                langButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                currentLanguage = selectedLang;
                updateLanguage(selectedLang);
                document.documentElement.lang = selectedLang;
            }
        });
    });
}

// Update page language
function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-text]');

    elements.forEach(element => {
        try {
            const textData = JSON.parse(element.getAttribute('data-text'));
            const translation = getText(textData);

            if (translation) {
                element.textContent = translation;
            }
        } catch (error) {
            console.warn('Error parsing translation data:', error);
        }
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Scroll reveal animation
function initializeScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    const animatedElements = document.querySelectorAll(
        '.overview-card, .project-card, .skill-category, .contact-item, .experience-item'
    );
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(16px)';
        element.style.transition = `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 3) * 60}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 3) * 60}ms`;
        observer.observe(element);
    });

    // Skill level bars fill when their category scrolls into view
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));
}

// Scroll progress bar under the header
function initializeScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
            ticking = false;
        });
    }, { passive: true });
}

// Typewriter effect cycling through roles in the hero subtitle
function initializeTypewriter() {
    const target = document.querySelector('[data-hero-subtitle]');
    const roles = portfolioData && portfolioData.personal.roles;
    if (!target || !roles) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const cursor = document.querySelector('.type-cursor');
        if (cursor) cursor.style.display = 'none';
        return;
    }

    // The typewriter owns this element — stop updateLanguage from resetting it
    target.removeAttribute('data-text');

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const list = roles[currentLanguage] || roles.en;
        const word = list[roleIndex % list.length];

        if (deleting) {
            charIndex--;
            target.textContent = word.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex++;
                setTimeout(tick, 350);
                return;
            }
            setTimeout(tick, 35);
        } else {
            charIndex++;
            target.textContent = word.slice(0, charIndex);
            if (charIndex >= word.length) {
                deleting = true;
                setTimeout(tick, 2200);
                return;
            }
            setTimeout(tick, 65);
        }
    }

    tick();
}

// Count-up animation for hero stats (parses "4+", "10+", "100%")
function initializeCounters() {
    const numbers = document.querySelectorAll('.stat-number');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    numbers.forEach(el => {
        const raw = el.textContent;
        const match = raw.match(/^(\d+)(.*)$/);
        if (!match) return;

        const end = parseInt(match[1], 10);
        const suffix = match[2];
        const duration = 1000;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * end) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        el.textContent = '0' + suffix;
        requestAnimationFrame(step);
    });
}

// Click-to-copy for the email address
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(() => {
        btn.classList.add('copied');
        btn.textContent = currentLanguage === 'es' ? '¡copiado!' : 'copied!';
        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = currentLanguage === 'es' ? 'copiar' : 'copy';
        }, 1600);
    });
});

// Scroll spy — highlights the active section in the header nav
function initializeScrollSpy() {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-section') === entry.target.id);
                });
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '-15% 0px -35% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Language switching with keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[data-lang="en"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[data-lang="es"]').click();
                break;
        }
    }
});
