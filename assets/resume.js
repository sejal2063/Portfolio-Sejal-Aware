/* =====================================================================
   RÉSUMÉ GENERATOR
   Builds a role-specific résumé straight from the portfolio page, so a
   new skill tag, system card, project card or job added to the page shows
   up in the matching résumés automatically.

   What it reads from the page:
     header & contact   →  [data-p="…"] fields in the Profile card (#profile)
     experience         →  #gitlog .commit           (training + .edu skipped)
     education          →  #gitlog .commit.edu
     MIS systems        →  #systems .sys
     software projects  →  #projects .proj
     tech skills        →  #stack .mod               (module name = .mod-h text)
     certifications     →  #stack .certs pre         (one per line)
     creative skills    →  #toolkit credits, #creative-services slates, #reels points
     creative projects  →  #reels .reel  +  #gallery frames grouped by filter
     years / months     →  the first two .stat counters in the Lab

   What lives only in this file: ROLES (title, summary, keywords, which skill
   modules to show) and CREATIVE_EXPERIENCE. Add a role by copying one entry.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const T = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the PDF font has no emoji / check marks; arrows read better as words
  const clean = s => String(s).replace(/\s*Full (breakdown|details) below\.?\s*[↓⬇]?/gi, '').replace(/\s*→\s*/g, ' to ').replace(/[↓↑←↗⬇]/g, '').replace(/[✓✦▶⌘●]/g, '').replace(/[\u{1F300}-\u{1FAFF}☀-➿]️?/gu, '').replace(/\s+/g, ' ').trim();

  /* ------------------------------------------------------------------
     1. CONFIG
     ------------------------------------------------------------------ */
  const CREATIVE_EXPERIENCE = {
    title: 'Freelance Content Creator & Graphic Designer',
    org: 'Self-employed · Instagram @imthedemira_2026',
    date: 'Freelance',
    bullets: [
      'Designed a complete social-media kit for a cafe: promotional banners, a printed food menu card and an animated Canva reel',
      'Create and edit Instagram reels with strong hooks, captions, transitions and pacing, including behind-the-scenes process content',
      'Produce a maximalist collage art series (CATholiC, RoadTrip) and share the making-of as short-form video',
      'Plan content and personal-branding visuals so a feed reads as one consistent brand'
    ]
  };

  // skills: [label, 'module', 'module:regex', …]  (regex filters that module's tags)
  // kinds:  which project sources to rank: sys = MIS systems, proj = software projects, reel, gallery
  const ROLES = [
    { id: 'data-analyst', track: 'tech', icon: '📊', label: 'Data Analyst', blurb: 'KPI dashboards, MIS reporting, SQL',
      headline: 'Data Analyst | MIS Reporting | KPI Dashboards & Automation',
      summary: 'Data Analyst with {tech} in tech, currently working {mis} as an MIS Executive & Data Analyst at a furniture and modular-kitchen manufacturer. I turn day-to-day production data into KPI dashboards, MIS reports and automated workflows using Google Sheets, Apps Script and SQL, and I build the web tools that capture clean data at the source.',
      kw: { data: 2, analysis: 3, analytics: 3, kpi: 3, dashboard: 3, report: 2, sql: 3, excel: 2, sheets: 2, mis: 2, visualization: 2, tracking: 2, trend: 2, recharts: 2, postgresql: 1, mysql: 1, mistake: 1, stats: 1 },
      skills: [['Data & Analytics', 'mis_and_data'], ['Databases & SQL', 'database'], ['Programming & AI', 'backend:java|php', 'frontend:javascript|typescript', 'ai:llm|prompt|generative'], ['Tools', 'tools:git|vs code|postman']],
      kinds: ['sys', 'proj'], maxProjects: 3, bullets: 3 },
    { id: 'mis-executive', track: 'tech', icon: '🗂️', label: 'MIS Executive', blurb: 'FMS, workflow automation, reporting',
      headline: 'MIS Executive | FMS & Workflow Automation | Google Sheets & Apps Script',
      summary: 'MIS Executive with {mis} of hands-on experience running MIS for a furniture and modular-kitchen manufacturer, and {tech} in tech overall. I design FMS workflows, automate production processes and build KPI dashboards on Google Sheets and Apps Script, replacing manual tracking with systems that the shop floor actually uses.',
      kw: { mis: 3, fms: 3, workflow: 3, automation: 3, 'apps script': 3, sheets: 3, kpi: 2, dashboard: 2, report: 2, production: 2, process: 2, tracking: 2, backup: 1, cutlist: 1, dispatch: 1 },
      skills: [['MIS & Automation', 'mis_and_data'], ['Databases', 'database:sql|mysql|postgres|supabase'], ['Web Development', 'frontend:html|css|javascript|react', 'backend:vercel|rest'], ['Tools', 'tools']],
      kinds: ['sys', 'proj'], maxProjects: 4, bullets: 3 },
    { id: 'full-stack', track: 'tech', icon: '🧩', label: 'Full Stack Developer', blurb: 'React, Spring Boot, REST, SQL',
      headline: 'Full Stack Developer | React | Java & Spring Boot | REST APIs',
      summary: 'Full Stack Developer with {tech} in tech across internships and a live production role. I build React front ends on top of Spring Boot REST APIs with JWT security, role-based access and MySQL/PostgreSQL, and I currently ship internal web apps for a manufacturing business, including a React + TypeScript measurement-to-production system.',
      kw: { react: 3, spring: 3, java: 3, rest: 3, api: 2, jwt: 2, mysql: 2, postgresql: 2, typescript: 2, 'full-stack': 3, 'role-based': 2, vercel: 1, docker: 1, 'web app': 1, endpoints: 2 },
      skills: [['Frontend', 'frontend'], ['Backend & APIs', 'backend'], ['Databases', 'database'], ['Mobile', 'mobile'], ['Tools', 'tools']],
      kinds: ['proj', 'sys'], maxProjects: 3, bullets: 3 },
    { id: 'frontend', track: 'tech', icon: '🖥️', label: 'Frontend / React Developer', blurb: 'React, TypeScript, UI',
      headline: 'Frontend Developer | React & TypeScript | Responsive UI',
      summary: 'Frontend Developer with {tech} in tech, building React and TypeScript interfaces for real business users. I care about clean, responsive UI (Tailwind, SVG, charts) and bring a designer\'s eye from my Canva and Figma work, plus enough backend (REST, JWT, SQL) to ship features end to end.',
      kw: { react: 3, typescript: 3, javascript: 2, tailwind: 2, ui: 2, figma: 2, vite: 2, svg: 2, responsive: 2, redux: 2, pwa: 2, dashboard: 1, recharts: 2, prototype: 2 },
      skills: [['Frontend', 'frontend'], ['UI Design', 'graphic design', 'brand identity:typography|colour'], ['APIs & Backend', 'backend:rest|jwt|spring|vercel'], ['Tools', 'tools']],
      kinds: ['proj', 'sys'], maxProjects: 3, bullets: 3 },
    { id: 'java-backend', track: 'tech', icon: '☕', label: 'Java Backend Developer', blurb: 'Spring Boot, REST, JWT, SQL',
      headline: 'Java Backend Developer | Spring Boot | REST APIs | SQL',
      summary: 'Java Backend Developer with {tech} in tech and Java Full Stack training from SevenMentor. I design Spring Boot REST APIs with JWT authentication and role-based access, model relational data in MySQL and PostgreSQL, and integrate those services with React and Flutter clients.',
      kw: { java: 3, spring: 3, rest: 3, api: 3, jwt: 3, mysql: 2, postgresql: 2, sql: 2, 'role-based': 2, database: 2, docker: 2, endpoints: 2, tables: 1 },
      skills: [['Backend & APIs', 'backend'], ['Databases', 'database'], ['Frontend', 'frontend:react|javascript|html'], ['Tools', 'tools']],
      kinds: ['proj', 'sys'], maxProjects: 3, bullets: 3 },
    { id: 'flutter', track: 'tech', icon: '📱', label: 'Flutter / Mobile Developer', blurb: 'Flutter, Dart, Firebase',
      headline: 'Flutter Developer | Cross-Platform Mobile Apps | Dart & Firebase',
      summary: 'Mobile developer with {tech} in tech, building cross-platform Flutter apps with real-time GPS tracking, Firebase authentication and messaging, and REST API integration. I also build the web dashboards and backends those apps report to.',
      kw: { flutter: 4, dart: 3, mobile: 3, firebase: 3, gps: 2, android: 3, maps: 2, 'real-time': 2, app: 1, rest: 1, pwa: 1, 'mobile-first': 2 },
      skills: [['Mobile', 'mobile'], ['Backend & APIs', 'backend:rest|jwt|spring|java'], ['Databases', 'database'], ['Tools', 'tools']],
      kinds: ['proj', 'sys'], maxProjects: 3, bullets: 3 },
    { id: 'automation', track: 'tech', icon: '⚙️', label: 'Automation / Apps Script Developer', blurb: 'Apps Script, web apps, AI',
      headline: 'Automation Developer | Google Apps Script | Workflow & AI Automation',
      summary: 'Automation developer with {tech} in tech and {mis} building live Google Apps Script systems for a manufacturer: FMS workflows, cutlist automation, KPI tracking and automated backups, each shipped as a web app the team uses daily. Experienced with LLM features and AI automation workflows from my internship.',
      kw: { 'apps script': 4, automation: 4, 'web app': 2, sheets: 2, drive: 2, workflow: 2, fms: 2, 'ai automation': 2, llm: 2, backup: 2, javascript: 2, automates: 3, automated: 3 },
      skills: [['Automation', 'mis_and_data:apps script|automation|fms|sheets|excel', 'ai'], ['Web', 'frontend:html|css|javascript|typescript|react', 'backend:rest|vercel'], ['Data', 'database:sql|postgres|mysql'], ['Tools', 'tools']],
      kinds: ['sys', 'proj'], maxProjects: 4, bullets: 3 },

    { id: 'content-creator', track: 'content', icon: '🎬', label: 'Content Creator', blurb: 'Reels, storytelling, Canva',
      headline: 'Content Creator | Instagram Reels | Canva Design & Storytelling',
      summary: 'Content creator and Canva designer who makes short-form content people stop scrolling for: reels with strong hooks and pacing, branded graphics and maximalist collage art, plus behind-the-scenes process content. My analytical day job as an MIS Executive means I also track what works and plan content with data.',
      kw: { reel: 3, content: 3, instagram: 3, canva: 3, video: 2, storytelling: 2, collage: 2, brand: 2, process: 2, hook: 2, animation: 2, banner: 1 },
      skills: [['Content & Video', 'creator', 'motion'], ['Design', 'graphic design', 'art direction', 'brand identity'], ['Strategy & Platforms', 'strategy', 'platforms'], ['Analytics', 'mis_and_data:data analysis|google sheets|ms excel|kpi']],
      kinds: ['reel', 'gallery'], maxProjects: 4, creative: true, bullets: 2 },
    { id: 'social-media', track: 'content', icon: '📣', label: 'Social Media Executive', blurb: 'Branding, planning, analytics',
      headline: 'Social Media Executive | Content Planning | Branding & Analytics',
      summary: 'Social media executive profile combining creative and analytical skills: I design on-brand posts, banners and reels in Canva, plan content and personal branding for Instagram and WhatsApp, and, from my role as an MIS Executive & Data Analyst, report on performance with dashboards and data.',
      kw: { instagram: 3, social: 3, 'content planning': 3, brand: 3, branding: 3, reel: 2, banner: 2, canva: 2, whatsapp: 2, analytics: 2, kpi: 1, dashboard: 1, report: 1 },
      skills: [['Social & Strategy', 'strategy', 'platforms', 'creator:instagram'], ['Design & Video', 'graphic design', 'motion', 'brand identity'], ['Analytics & Reporting', 'mis_and_data:data analysis|kpi|google sheets|ms excel|mis reporting']],
      kinds: ['reel', 'gallery'], maxProjects: 4, creative: true, bullets: 2 },
    { id: 'graphic-designer', track: 'content', icon: '🎨', label: 'Graphic Designer', blurb: 'Canva, logos, print, branding',
      headline: 'Graphic Designer | Canva & Figma | Branding, Social & Print',
      summary: 'Graphic designer working in Canva and Figma across social media creatives, logos and brand identity, menu cards and print, and maximalist collage art. I build layouts with clear typography and colour, keep every piece on-brand, and deliver files ready for Instagram, WhatsApp or print.',
      kw: { canva: 3, figma: 3, logo: 3, brand: 3, typography: 3, colour: 2, menu: 3, print: 3, banner: 3, collage: 2, design: 2, moodboard: 2, poster: 2 },
      skills: [['Design Tools', 'graphic design'], ['Brand & Art Direction', 'brand identity', 'art direction'], ['Deliverables', 'services', 'print'], ['Also', 'motion', 'frontend:html|css']],
      kinds: ['gallery', 'reel'], maxProjects: 4, creative: true, bullets: 1 },
    { id: 'video-editor', track: 'content', icon: '🎞️', label: 'Video / Reels Editor', blurb: 'Editing, motion, captions',
      headline: 'Video & Reels Editor | Short-Form Editing | Canva Animation',
      summary: 'Reels and short-form video editor focused on hooks, cuts, captions, transitions and pacing that keep people watching. I create animated Canva reels for brands and process videos for my own creative work, and I design the matching graphics myself.',
      kw: { video: 4, edit: 3, reel: 4, animation: 3, motion: 3, caption: 2, transitions: 2, pacing: 2, canva: 2, process: 2 },
      skills: [['Video', 'creator', 'motion'], ['Design', 'graphic design', 'art direction'], ['Platforms', 'platforms']],
      kinds: ['reel', 'gallery'], maxProjects: 4, creative: true, bullets: 1 }
  ];

  const ACCENT = { tech: '#1f3a5f', content: '#7a2c3a' };
  const PDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/';

  /* ------------------------------------------------------------------
     2. READ THE PORTFOLIO
     ------------------------------------------------------------------ */
  function readPortfolio() {
    const P = {};
    $$('[data-p]').forEach(el => { const k = el.dataset.p; if (!P[k]) P[k] = { text: T(el), href: el.getAttribute('href') || '' }; });

    const stats = $$('.stat').map(s => ({ n: +(($('[data-count]', s) || {}).dataset || {}).count || 0, u: T($('small', s)) }));
    const dur = st => { if (!st) return ''; const u = /yr|year/i.test(st.u) ? 'year' : 'month'; return st.n + ' ' + u + (st.n === 1 ? '' : 's'); };

    const M = {};
    $$('#stack .mod').forEach(m => { const name = T($('.mod-h', m)).replace(/^\d+/, '').replace(/\/$/, '').trim().toLowerCase(); M[name] = $$('.tags span', m).map(T); });
    $$('#toolkit .cr-list:not([aria-hidden]) .cr:not(.big)').forEach(c => { M[T($('dt', c)).toLowerCase()] = T($('dd', c)).split('·').map(s => s.trim()).filter(Boolean); });
    M.services = $$('#creative-services .slate h3').map(T);
    M.creator = $$('#reels .cp h4').map(T);

    const jobs = [], education = [];
    $$('#gitlog .commit').forEach(c => {
      const title = T($('h3', c)), org = T($('.c-org', c));
      const date = T($('.c-date', c)).replace(/·.*$/, '').replace(/\s*—\s*/g, ' – ').replace(/present/i, 'Present').trim();
      if (c.classList.contains('edu')) { const [degree, ...rest] = title.split('·').map(s => s.trim()); education.push({ degree, detail: rest.join(' · '), org, date }); return; }
      if (/training|course|bootcamp/i.test(title)) return;
      jobs.push({ title, org, date, bullets: $$('li', c).map(T) });
    });

    const certs = (T($('#stack .certs pre')) ? $('#stack .certs pre').textContent.split('\n') : [])
      .map(l => clean(l).replace(/\s{2,}/g, ' ')).filter(Boolean).map(l => l.split('·').map(s => s.trim()).filter(Boolean).join(' · '));

    const abs = href => { if (!href) return ''; try { return new URL(href, siteUrl(P)).href; } catch (_) { return href; } };
    const STATUS = { live: 'Live', testing: 'In testing', dev: 'In development' };
    const projects = [];
    $$('#systems .sys').forEach(s => {
      const open = $$('.links a', s).find(a => /open/i.test(T(a)));
      projects.push({ kind: 'sys', name: T($('h3', s)), desc: T($('p:not(.note)', s)), bullets: [], tags: $$('.tags span', s).map(T), status: STATUS[s.dataset.status] || '', link: open ? abs(open.getAttribute('href')) : '', context: 'MIS system' });
    });
    // the featured SmartMeasure section adds detail (bullets + full stack) to its system card
    const feat = $('#smartmeasure'), featName = feat ? T($('.l-title .g', feat)) : '';
    if (featName) projects.forEach(p => {
      if (!p.name.toLowerCase().startsWith(featName.toLowerCase())) return;
      p.bullets = $$('.f-info li', feat).map(T).filter(b => !/in progress/i.test(b));
      p.tags = $$('.f-info .tags span', feat).map(T).concat(p.tags).filter((t, i, a) => a.findIndex(x => x.toLowerCase().startsWith(t.toLowerCase().split(' ')[0])) === i);
    });
    $$('#projects .proj').forEach(p => {
      const a = $('.links a', p);
      projects.push({ kind: 'proj', name: T($('h3', p)), desc: T($('p', p)), bullets: $$('li', p).map(T), tags: $$('.tags span', p).map(T), status: '', link: a ? abs(a.getAttribute('href')) : '' });
    });
    $$('#reels .reel').forEach(r => {
      const name = T($('figcaption b', r)), desc = T($('figcaption small', r));
      projects.push({ kind: 'reel', name, desc, bullets: [], tags: ['Instagram Reel', 'Video Editing'].concat(/canva/i.test(desc) ? ['Canva Animation'] : ['Process Content']), status: '', link: abs('#reels') });
    });
    $$('#gallery .f-btn').forEach(b => {
      const f = b.dataset.f; if (!f || f === 'all') return;
      const frames = $$('#gallery .frame').filter(fr => fr.dataset.cat === f); if (!frames.length) return;
      const titles = frames.map(fr => { const cap = $('figcaption', fr); return cap && cap.firstChild ? cap.firstChild.textContent.trim() : ''; }).filter(Boolean);
      const type = T($('figcaption small', frames[0])).split('·').slice(1).map(s => s.trim()).join(' ');
      const name = type ? type.charAt(0).toUpperCase() + type.slice(1) + (frames.length > 1 ? ' series' : '') : T(b);
      projects.push({ kind: 'gallery', name, desc: (frames.length > 1 ? frames.length + ' pieces: ' : '') + titles.map(t => '“' + t + '”').join(', '), bullets: [], tags: ['Canva', 'Graphic Design'], status: '', link: abs('#gallery') });
    });

    return { P, M, jobs, education, certs, projects, tech: dur(stats[0]), mis: dur(stats[1]) };
  }

  function siteUrl(P) {
    if (/^https?:/.test(location.protocol)) return location.origin + location.pathname.replace(/[^/]*$/, '');
    return (P && P.portfolio && P.portfolio.href) || 'https://example.com/';
  }

  /* ------------------------------------------------------------------
     3. BUILD A RÉSUMÉ MODEL FOR ONE ROLE
     ------------------------------------------------------------------ */
  const score = (text, kw) => { const t = ' ' + text.toLowerCase() + ' '; let s = 0; for (const k in kw) if (t.includes(k)) s += kw[k]; return s; };

  function build(roleId) {
    const D = readPortfolio(), R = ROLES.find(r => r.id === roleId) || ROLES[0];
    const P = D.P, pf = siteUrl(P);
    const short = href => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

    const contacts = [];
    const push = (k, text, href) => { if (P[k]) contacts.push({ text: text || P[k].text, href: href === undefined ? P[k].href : href }); };
    push('location', null, '');
    push('phone');
    push('email');
    if (P.linkedin) push('linkedin', short(P.linkedin.href));
    if (R.track === 'tech' && P.github) push('github', short(P.github.href));
    if (R.track === 'content' && P.instagram) push('instagram', P.instagram.text);
    contacts.push({ text: short(pf), href: pf });

    const skills = [];
    R.skills.forEach(([label, ...refs]) => {
      const seen = new Set(), items = [];
      refs.forEach(ref => {
        const i = ref.indexOf(':'), mod = i < 0 ? ref : ref.slice(0, i), rx = i < 0 ? null : new RegExp(ref.slice(i + 1), 'i');
        (D.M[mod] || []).forEach(tag => { if (rx && !rx.test(tag)) return; const k = tag.toLowerCase(); if (!seen.has(k)) { seen.add(k); items.push(clean(tag)); } });
      });
      if (items.length) skills.push({ label, items });
    });

    const pick = (list, n) => list.map((b, i) => ({ b, i, s: score(b, R.kw) })).sort((a, z) => z.s - a.s || a.i - z.i).slice(0, n).sort((a, z) => a.i - z.i).map(x => clean(x.b));
    let experience;
    if (R.creative) {
      experience = [CREATIVE_EXPERIENCE].concat(D.jobs.slice(0, 1).map(j => ({ ...j, bullets: pick(j.bullets, R.bullets) })));
    } else {
      experience = D.jobs.map(j => ({ ...j, bullets: pick(j.bullets, R.bullets) }));
    }
    experience = experience.map(e => ({ title: clean(e.title), org: clean(e.org), date: e.date, bullets: e.bullets.map(clean) }));

    const projects = D.projects
      .filter(p => R.kinds.includes(p.kind))
      .map((p, i) => ({ p, i, s: score([p.name, p.desc, p.bullets.join(' '), p.tags.join(' ')].join(' '), R.kw) + (R.kinds.indexOf(p.kind) === 0 ? 1 : 0) - (p.status === 'In development' ? 2 : 0) }))
      .filter(x => x.s > 0)
      .sort((a, z) => z.s - a.s || a.i - z.i)
      .slice(0, R.maxProjects)
      .map(({ p }) => ({
        name: clean(p.name), tech: p.tags.slice(0, 6).map(clean).join(', '), status: p.status, link: p.link,
        lines: [clean(p.desc)].concat(pick(p.bullets, p.desc ? 1 : 2)).filter(Boolean)
      }));

    const certs = R.track === 'tech' ? D.certs : D.certs.filter(c => score(c, R.kw) > 0);

    return {
      role: R, accent: ACCENT[R.track], name: (P.name && P.name.text) || 'Sejal Kailas Aware', headline: R.headline, contacts,
      summary: R.summary.replace('{tech}', D.tech || '1 year').replace('{mis}', D.mis || 'several months'),
      skills, experience, projects, education: D.education, certs,
      file: ((P.name && P.name.text) || 'Resume').split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).join('_') + '_' + R.label.replace(/[^a-z0-9]+/gi, '_').replace(/_+$/, '') + '_Resume.pdf'
    };
  }

  /* ------------------------------------------------------------------
     4. RENDER: HTML preview + PDF (pdfmake, real selectable text)
     ------------------------------------------------------------------ */
  function toHTML(m) {
    const sec = (t, body) => body ? `<section><h4>${t}</h4>${body}</section>` : '';
    const ul = a => a.length ? `<ul>${a.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
    return `<div class="rp" style="--ac:${m.accent}">
      <header><h3>${esc(m.name)}</h3><p class="rp-head">${esc(m.headline)}</p>
      <p class="rp-contact">${m.contacts.map(c => c.href ? `<a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.text)}</a>` : esc(c.text)).join('<i>|</i>')}</p></header>
      ${sec('Professional Summary', `<p class="rp-sum">${esc(m.summary)}</p>`)}
      ${sec('Skills', m.skills.length ? `<dl>${m.skills.map(g => `<dt>${esc(g.label)}</dt><dd>${esc(g.items.join(', '))}</dd>`).join('')}</dl>` : '')}
      ${sec('Professional Experience', m.experience.map(e => `<div class="rp-item"><div class="rp-row"><b>${esc(e.title)}</b><span>${esc(e.date)}</span></div><div class="rp-org">${esc(e.org)}</div>${ul(e.bullets)}</div>`).join(''))}
      ${sec(m.role.creative ? 'Portfolio Projects' : 'Projects & Systems', m.projects.map(p => `<div class="rp-item"><div class="rp-row"><b>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</b><span>${esc(p.status)}</span></div><div class="rp-org">${esc(p.tech)}</div>${ul(p.lines)}</div>`).join(''))}
      ${sec('Education', m.education.map(e => `<div class="rp-item"><div class="rp-row"><b>${esc(e.degree)} <em class="rp-org">| ${esc([e.org, e.detail].filter(Boolean).join(' · '))}</em></b><span>${esc(e.date)}</span></div></div>`).join(''))}
      ${sec('Certifications', m.certs.length ? `<p class="rp-sum">${m.certs.map(esc).join('&nbsp;&nbsp;•&nbsp;&nbsp; ')}</p>` : '')}
    </div>`;
  }

  function toPdfDoc(m) {
    const A = m.accent, G = '#555555', W = 515;
    const H = t => [
      { text: t.toUpperCase(), fontSize: 10.5, bold: true, color: A, characterSpacing: 0.6, margin: [0, 8, 0, 2] },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: W, y2: 0, lineWidth: 0.8, lineColor: A }], margin: [0, 0, 0, 4] }
    ];
    const row = (left, right) => ({ columns: [{ text: left, width: '*' }, { text: right || '', width: 'auto', bold: true, fontSize: 9, color: '#333333', alignment: 'right' }], columnGap: 8, margin: [0, 4, 0, 0] });
    const contact = [];
    m.contacts.forEach((c, i) => { if (i) contact.push({ text: '  |  ', color: '#999999' }); contact.push(c.href ? { text: c.text, link: c.href, color: '#1a1a1a' } : { text: c.text }); });
    const content = [
      { text: m.name.toUpperCase(), fontSize: 20, bold: true, color: A, alignment: 'center', characterSpacing: 1 },
      { text: m.headline, fontSize: 10.5, color: '#333333', bold: true, alignment: 'center', margin: [0, 2, 0, 3] },
      { text: contact, fontSize: 8.6, alignment: 'center', color: '#333333' },
      ...H('Professional Summary'), { text: m.summary, alignment: 'justify' }
    ];
    if (m.skills.length) content.push(...H('Skills'), { table: { widths: [112, '*'], body: m.skills.map(g => [{ text: g.label + ':', bold: true }, { text: g.items.join(', ') }]) }, layout: { defaultBorder: false, paddingLeft: () => 0, paddingRight: () => 4, paddingTop: () => 1.2, paddingBottom: () => 1.2 } });
    if (m.experience.length) {
      content.push(...H('Professional Experience'));
      m.experience.forEach(e => content.push({ stack: [row([{ text: e.title, bold: true }], e.date), { text: e.org, italics: true, color: G, fontSize: 9 }, e.bullets.length ? { ul: e.bullets, margin: [8, 2, 0, 0] } : ''], unbreakable: true }));
    }
    if (m.projects.length) {
      content.push(...H(m.role.creative ? 'Portfolio Projects' : 'Projects & Systems'));
      m.projects.forEach(p => content.push({ stack: [row([p.link ? { text: p.name, bold: true, link: p.link, color: A } : { text: p.name, bold: true }], p.status), p.tech ? { text: p.tech, italics: true, color: G, fontSize: 9 } : '', { ul: p.lines, margin: [8, 2, 0, 0] }], unbreakable: true }));
    }
    if (m.education.length) { content.push(...H('Education')); m.education.forEach(e => content.push(row([{ text: e.degree, bold: true }, { text: '  |  ' + [e.org, e.detail].filter(Boolean).join(' · '), color: G }], e.date))); }
    if (m.certs.length) content.push({ stack: [...H('Certifications'), { text: m.certs.join('   •   ') }], unbreakable: true });
    return {
      pageSize: 'A4', pageMargins: [40, 30, 40, 30], content,
      defaultStyle: { fontSize: 9.2, lineHeight: 1.1, color: '#1a1a1a' },
      info: { title: m.name + ' – ' + m.role.label + ' Résumé', author: m.name, subject: m.headline }
    };
  }

  let pdfLoading = null;
  function loadPdfLib() {
    if (window.pdfMake && window.pdfMake.vfs) return Promise.resolve();
    if (pdfLoading) return pdfLoading;
    const add = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('could not load ' + src)); document.head.appendChild(s); });
    pdfLoading = add(PDF_CDN + 'pdfmake.min.js').then(() => add(PDF_CDN + 'vfs_fonts.min.js')).catch(e => { pdfLoading = null; throw e; });
    return pdfLoading;
  }

  // fallback when the PDF library can't load (offline): print view → "Save as PDF"
  function printFallback(m) {
    const w = window.open('', '_blank'); if (!w) return false;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(m.file.replace(/\.pdf$/, ''))}</title><style>${PAPER_CSS}@page{size:A4;margin:14mm}body{margin:0;font-family:Arial,Helvetica,sans-serif}.rp{box-shadow:none;padding:0;max-width:none}</style></head><body>${toHTML(m)}<script>onload=()=>print()<\/script></body></html>`);
    w.document.close(); return true;
  }

  async function download(roleId, btn) {
    const m = build(roleId);
    const label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Preparing PDF…'; }
    try {
      await loadPdfLib();
      window.pdfMake.createPdf(toPdfDoc(m)).download(m.file);
      if (btn) btn.textContent = '✓ Downloaded';
    } catch (e) {
      console.warn('[resume] PDF engine unavailable, using print view', e);
      if (!printFallback(m) && btn) btn.textContent = 'Allow pop-ups to save the PDF';
    } finally {
      if (btn) setTimeout(() => { btn.disabled = false; btn.innerHTML = label; }, 1800);
    }
  }

  /* ------------------------------------------------------------------
     5. MODAL UI
     ------------------------------------------------------------------ */
  const PAPER_CSS = `.rp{background:#fff;color:#1a1a1a;font:12px/1.42 Arial,Helvetica,sans-serif;padding:30px 34px;max-width:720px;margin:0 auto;text-align:left}
.rp a{color:inherit;text-decoration:none}.rp header{text-align:center}.rp h3{font:700 23px/1.1 Arial,Helvetica,sans-serif;color:var(--ac);letter-spacing:.04em;text-transform:uppercase;margin:0}
.rp-head{font-weight:700;color:#333;margin:4px 0 3px}.rp-contact{font-size:10.5px;color:#333}.rp-contact i{font-style:normal;color:#aaa;margin:0 6px}
.rp section{margin-top:11px}.rp h4{font:700 12px/1 Arial,Helvetica,sans-serif;color:var(--ac);letter-spacing:.05em;text-transform:uppercase;border-bottom:1.2px solid var(--ac);padding-bottom:3px;margin:0 0 5px}
.rp-sum{text-align:justify;margin:0}.rp dl{display:grid;grid-template-columns:130px 1fr;gap:2px 8px;margin:0}.rp dt{font-weight:700}.rp dd{margin:0}
.rp-item{margin-top:5px;break-inside:avoid}.rp-row{display:flex;justify-content:space-between;gap:10px}.rp-row span{font-weight:700;font-size:11px;color:#333;white-space:nowrap}.rp-row b a{color:var(--ac)}
.rp-org{font-style:italic;color:#555;font-size:11px}.rp ul{margin:2px 0 0 16px;padding:0}.rp li{margin:1px 0}`;

  let modal, current = { track: 'tech', role: null };

  function ensureModal() {
    if (modal) return modal;
    const st = document.createElement('style'); st.textContent = PAPER_CSS; document.head.appendChild(st);
    modal = document.createElement('div');
    modal.className = 'rz'; modal.id = 'rz'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'rz-title');
    modal.innerHTML = `<div class="rz-panel" tabindex="-1">
      <header class="rz-head">
        <div><span class="rz-kicker">résumé generator</span><h2 id="rz-title">Pick a role. Get a résumé built for it.</h2>
        <p>Skills, experience and projects are pulled live from this portfolio and ranked for the role you choose.</p></div>
        <button class="rz-x" type="button" aria-label="Close">✕</button>
      </header>
      <div class="rz-tabs" role="tablist">
        <button type="button" role="tab" data-track="tech">⌘ Technical roles</button>
        <button type="button" role="tab" data-track="content">▶ Creative roles</button>
      </div>
      <div class="rz-body">
        <div class="rz-roles" role="radiogroup" aria-label="Job role"></div>
        <div class="rz-preview" aria-label="Résumé preview"><div class="rz-paper" id="rz-paper"></div></div>
      </div>
      <footer class="rz-foot"><span id="rz-meta"></span><button type="button" class="rz-dl" id="rz-dl">Download PDF ↓</button></footer>
    </div>`;
    document.body.appendChild(modal);
    $('.rz-x', modal).addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') { const f = $$('button:not([disabled]),a[href]', modal).filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    $$('.rz-tabs button', modal).forEach(b => b.addEventListener('click', () => setTrack(b.dataset.track)));
    $('#rz-dl', modal).addEventListener('click', e => download(current.role, e.currentTarget));
    return modal;
  }

  function setTrack(track) {
    current.track = track;
    $('.rz-panel', modal).dataset.track = track;
    $$('.rz-tabs button', modal).forEach(b => { const on = b.dataset.track === track; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const box = $('.rz-roles', modal);
    box.innerHTML = ROLES.filter(r => r.track === track).map(r => `<button type="button" role="radio" class="rz-role" data-role="${r.id}"><span class="ri">${r.icon}</span><span><b>${esc(r.label)}</b><small>${esc(r.blurb)}</small></span></button>`).join('');
    $$('.rz-role', box).forEach(b => b.addEventListener('click', () => setRole(b.dataset.role)));
    const keep = ROLES.find(r => r.id === current.role && r.track === track);
    setRole(keep ? keep.id : ROLES.find(r => r.track === track).id);
  }

  function setRole(id) {
    current.role = id;
    $$('.rz-role', modal).forEach(b => { const on = b.dataset.role === id; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const m = build(id);
    $('#rz-paper', modal).innerHTML = toHTML(m);
    $('.rz-preview', modal).scrollTop = 0;
    const n = m.skills.reduce((a, g) => a + g.items.length, 0);
    $('#rz-meta', modal).textContent = `${m.role.label} · ${n} skills · ${m.experience.length} roles · ${m.projects.length} projects matched`;
    $('#rz-dl', modal).innerHTML = `Download ${esc(m.role.label)} résumé <span aria-hidden="true">↓</span>`;
  }

  let lastFocus = null;
  function open(track) {
    ensureModal();
    lastFocus = document.activeElement;
    setTrack(track === 'content' || track === 'tech' ? track : current.track);
    modal.hidden = false;
    document.documentElement.classList.add('rz-lock');
    requestAnimationFrame(() => modal.classList.add('open'));
    const on = $('.rz-role.on', modal); (on || $('.rz-panel', modal)).focus();
    loadPdfLib().catch(() => {});   // warm up so the download is instant
  }
  function close() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('open');
    document.documentElement.classList.remove('rz-lock');
    setTimeout(() => { modal.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal && !modal.hidden) close(); });
  document.addEventListener('click', e => {
    const t = e.target.closest('.rz-open'); if (!t) return;
    e.preventDefault();
    const mm = document.getElementById('mobile-menu'); if (mm) mm.classList.remove('open');
    open(t.dataset.track);
  });

  window.SejalResume = { roles: ROLES, build, download, open };
})();
