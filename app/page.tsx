'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SiteImage } from '@/components/site-image';
import './home.css';

const repos = [
  { name: 'Burnae', color: 'mint' },
  { name: 'ADOFAI Verse', color: 'violet', url: 'https://github.com/3289david/ADOFAI-Verse' },
  { name: 'Furry', color: 'pink' },
  { name: 'textly-wakeup', color: 'blue' },
  { name: 'rukkitai', color: 'lime' },
  { name: 'ismyblog', color: 'orange' },
  { name: 'krl-kr', color: 'blue' },
  { name: 'GiveMeSomeTokens', color: 'lime' },
  { name: 'silentshield', color: 'mint' },
  { name: 'Forgelite', color: 'orange' },
  { name: 'Monote', color: 'violet' },
  { name: 'Digital Passport', color: 'blue', url: 'https://github.com/3289david/digital-passport' },
].map(repo => ({ ...repo, url: repo.url ?? `https://github.com/3289david/${repo.name}` }));
const sites = ['burnae.kr','filetosite.com','givemesometokens.dev','ismy.blog','krl.kr','modderai.net','proxywarp.com','rukkitai.org','rukkit.net','shopvalor.cc','textly.im'];
const tech = ['JavaScript','TypeScript','HTML','CSS','Node.js','Express','Python','Linux','Git','Cloudflare','Vercel'];

export default function Page() {
  const root = useRef<HTMLElement>(null);
  const [ko, setKo] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem('portfolio-language');
    if (saved === 'ko' || saved === 'en') {
      setKo(saved === 'ko');
      return;
    }
    const browserPrefersKorean = navigator.languages.some(language => language.toLowerCase().startsWith('ko'));
    const inKorea = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Seoul';
    setKo(browserPrefersKorean || inKorea);
  }, []);
  useEffect(() => { document.documentElement.lang = ko ? 'ko' : 'en'; }, [ko]);
  const toggleLanguage = () => setKo(current => {
    const next = !current;
    window.localStorage.setItem('portfolio-language', next ? 'ko' : 'en');
    return next;
  });
  useGSAP(() => {
    gsap.registerPlugin(useGSAP, ScrollTrigger);
    const host = root.current;
    if (!host) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('.hero-name', { y: 44, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85 })
        .fromTo('.hero-role', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.42')
        .fromTo('.portrait-clip', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.85 }, '-=0.25')
        .fromTo('.gif-clip', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.85 }, '-=0.58');
      gsap.utils.toArray<HTMLElement>('.focus-item').forEach((item, i) => {
        gsap.fromTo(item, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none reverse' } });
      });
      gsap.utils.toArray<HTMLElement>('.project-row').forEach((row) => {
        gsap.fromTo(row.querySelector('.row-rule'), { scaleX: 0, transformOrigin: 'left center' }, {
          scaleX: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 55%', scrub: 0.6 },
        });
        gsap.fromTo(row.querySelector('.project-art'), { clipPath: 'inset(12% 12% 12% 12%)', scale: 0.94 }, {
          clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 88%', end: 'center 58%', scrub: 0.7 },
        });
      });
      return () => mm.revert();
    });
    const ready = document.fonts.ready.then(() => ScrollTrigger.refresh());
    void ready;
    return () => mm.revert();
  }, { scope: root });

  return <main ref={root} className="portfolio">
    <header className="topbar"><a className="wordmark" href="#top"><span className="wordmark-dot"/>AUDEST</a><nav aria-label="Main navigation"><a href="#now">{ko ? '진행 중' : 'Building'}</a><a href="#work">{ko ? '프로젝트' : 'Projects'}</a><a href="#about">{ko ? '소개' : 'About'}</a><a href="#build">{ko ? '만드는 방식' : 'Build'}</a><a href="#sites">{ko ? '사이트' : 'Sites'}</a></nav><div className="top-actions"><button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={ko ? 'Switch to English' : '한국어로 보기'}>{ko ? 'EN' : '한국어'}</button><a className="top-contact" href="mailto:contact@rukkit.net">{ko ? '연락하기' : 'Get in touch'} <span>↗</span></a></div></header>
    <section className="hero" id="top">
      <div className="hero-copy"><p className="eyebrow"><span className="live-dot"/> {ko ? '풀스택 개발자' : 'FULL-STACK DEVELOPER'} <span className="eyebrow-location">/ {ko ? '서울, 대한민국' : 'SEOUL, KR'}</span></p>
        <h1 className="hero-name">Audest</h1>
        <p className="hero-role">{ko ? '웹과 클라우드, 호기심을 현실로 만듭니다.' : 'I build for the web, the cloud, and the curious.'}</p>
        <p className="hero-description">{ko ? '웹 개발, 클라우드 인프라, 보안, 오픈 소스에 관심이 있는 개발자입니다.' : 'Developer interested in web development, cloud infrastructure, security, and open source.'}</p>
        <div className="hero-actions"><a className="button button-lime" href="https://github.com/3289david" target="_blank" rel="noreferrer">{ko ? '깃허브 보기' : 'View GitHub'} <span>↗</span></a><a className="text-link" href="#work">{ko ? '주요 작업 보기' : 'See selected work'} <span>↓</span></a></div>
      </div>
      <div className="hero-visual"><div className="portrait-clip"><SiteImage name="auden-avatar" className="portrait" alt={ko ? '표면에 머리를 기대고 있는 파란 눈의 회색 늑대 캐릭터 그림' : 'Square illustration of a gray wolf character with blue eyes resting its head on a surface'}/></div><div className="portrait-note"><span>{ko ? '그림 01' : 'FIG. 01'}</span><span>{ko ? '만드는 사람' : 'BUILDER / MAKER'}</span></div><div className="gif-clip"><img className="hero-gif" src="https://miro.medium.com/v2/1*E8IgOSkMTpBRs0w0-Zsx2g.gif" alt="Animated artwork selected by Auden"/></div><span className="visual-coordinate">37°33' N&nbsp; 126°58' E</span></div>
      <div className="hero-bottom"><span>{ko ? '독립 개발자' : 'INDEPENDENT DEVELOPER'}</span><a href="#work">{ko ? '스크롤하여 둘러보기' : 'SCROLL TO EXPLORE'} <span>↓</span></a><span>{ko ? '새로운 도전을 기다립니다' : "AVAILABLE FOR WHAT'S NEXT"}</span></div>
    </section>
    <section className="now-section" id="now"><div className="now-intro"><p className="eyebrow">01 / {ko ? '현재 만드는 중' : 'CURRENTLY BUILDING'}</p><h2>{ko ? '작업대 위의 프로젝트' : 'On the workbench'}<span className="lime">.</span></h2><p>{ko ? '지금 진행 중인 프로젝트입니다.' : 'Projects currently in progress.'}</p></div><div className="now-projects">{[['Burnae','burnae','B'],['SilentShield','SilentShield','S'],['Auren','auren','A']].map(([name,slug,initial],i)=><a key={slug} href={`https://github.com/3289david/${slug}`} target="_blank" rel="noreferrer" className="now-project"><span className="now-meta">0{i+1} — {ko ? '저장소 열기' : 'OPEN REPOSITORY'}</span><h3>{name}<span>↗</span></h3><p>{ko ? 'GitHub에서 프로젝트 보기' : 'View the project on GitHub'}</p><i aria-hidden="true">{initial}</i></a>)}</div></section>
    <section className="work-section" id="work"><div className="section-heading"><div><p className="eyebrow">02 / {ko ? '주요 작업' : 'SELECTED WORK'}</p><h2>{ko ? <>만들어 온<br className="mobile-break"/> 것들</> : <>Things I’ve<br className="mobile-break"/> been building</>}<span className="lime">.</span></h2></div><a className="section-link" href="https://github.com/3289david?tab=repositories" target="_blank" rel="noreferrer">{ko ? '모든 저장소' : 'All repositories'} <span>↗</span></a></div>
      <div className="project-list">{repos.map((repo, i) => <a className="project-row" href={repo.url} target="_blank" rel="noreferrer" key={repo.name} aria-label={ko ? `GitHub에서 ${repo.name} 자세히 보기` : `Find out more about ${repo.name} on GitHub`}><div className="row-rule"/><span className="project-number">{String(i + 1).padStart(2,'0')}</span><div className={`project-art art-${repo.color}`} aria-hidden="true"><span className="art-grid"/><span className="art-glyph">{repo.name.slice(0,1)}</span><span className="art-orbit orbit-one"/><span className="art-orbit orbit-two"/><span className="art-caption">BUILD / {String(i + 1).padStart(2,'0')}</span></div><div className="project-copy"><p className="project-type">{ko ? '깃허브 저장소' : 'GITHUB REPOSITORY'}</p><h3>{repo.name}<span className="project-arrow">↗</span></h3><p className="project-detail">{ko ? '자세히 보기' : 'Find out more'} <span aria-hidden="true">↗</span></p></div><span className="row-arrow" aria-hidden="true">↗</span></a>)}</div>
      <div className="archive-repos"><p className="eyebrow">{ko ? '저장소 더 보기' : 'MORE FROM THE REPOSITORY LIST'}</p><div>{[['ai-terminal',ko ? '프로필에 등록된 저장소' : 'Profile-listed repository'],['mdview-cli',ko ? '프로필에 등록된 저장소' : 'Profile-listed repository'],['ai-ghost-blogger',ko ? '프로필에 등록된 저장소' : 'Profile-listed repository']].map(([name, description])=><a className="archive-repo" href={`https://github.com/3289david/${name}`} target="_blank" rel="noreferrer" key={name}><span><b>{name}</b><small>{description}</small></span><i aria-hidden="true">↗</i></a>)}</div></div>
    </section>
    <section className="about-section" id="about"><div className="about-intro"><p className="eyebrow">03 / {ko ? '나를 소개합니다' : 'A LITTLE ABOUT ME'}</p><h2>{ko ? <>호기심을<br/>작동하는<br/><span className="lime">코드로.</span></> : <>Curiosity,<br/>turned into<br/><span className="lime">working code.</span></>}</h2></div><div className="about-detail"><p className="about-lead">{ko ? '서울을 기반으로 활동하는 풀스택 개발자 Audest입니다. 웹, 인프라, 보안 분야에서 유용한 것을 만드는 일을 좋아합니다.' : 'I’m Audest, a full-stack developer based in Seoul. I like making useful things across the web, infrastructure, and security.'}</p><p className="about-copy">{ko ? '오픈 소스 도구부터 창작자를 위한 제품까지, 아이디어를 처음 구상한 순간부터 사람들이 실제로 쓸 수 있는 것으로 만드는 과정을 즐깁니다.' : 'From open-source tools to products for creators, I enjoy taking an idea from a first sketch to something people can use.'}</p><div className="tech-block"><p className="eyebrow">{ko ? '주로 사용하는 기술' : 'TOOLS I WORK WITH'}</p><div className="tech-list">{tech.map(item => <span key={item}>{item}</span>)}</div></div><div className="about-visual" aria-label={ko ? '코드에서 영감을 받은 기하학적 장식 이미지' : 'Decorative geometric code-inspired artwork'}><div className="visual-lines"/><div className="visual-sun"/><span className="visual-label">{ko ? '시스템 / 아이디어 / 2025—' : 'SYSTEMS / IDEAS / 2025—'}</span></div></div></section>
    <section className="focus-section" id="focus"><div className="focus-heading"><p className="eyebrow">04 / {ko ? '관심 분야' : 'AREAS OF CURIOSITY'}</p><h2>{ko ? <>변화를 만들고<br/>싶은 분야</> : <>Where I like<br/>to make a difference</>}<span className="lime">.</span></h2><p>{ko ? '계속 만들고 탐구하게 하는 아이디어와 분야입니다.' : 'Ideas and disciplines that keep me building.'}</p></div><div className="focus-list"><article className="focus-item"><span>01</span><div><h3>{ko ? '웹 경험' : 'Web experiences'}</h3><p>{ko ? 'JavaScript, TypeScript, HTML, CSS, Node.js, Express를 활용해 프런트엔드와 백엔드 전반을 만듭니다.' : 'Building across the frontend and backend with JavaScript, TypeScript, HTML, CSS, Node.js and Express.'}</p></div><b aria-hidden="true">↗</b></article><article className="focus-item"><span>02</span><div><h3>{ko ? '클라우드와 인프라' : 'Cloud &amp; infrastructure'}</h3><p>{ko ? 'Cloudflare, Vercel, Linux 등 웹 프로젝트를 운영하는 시스템과 플랫폼을 탐구합니다.' : 'Exploring the systems and platforms that help web projects run, including Cloudflare, Vercel and Linux.'}</p></div><b aria-hidden="true">↗</b></article><article className="focus-item"><span>03</span><div><h3>{ko ? '보안' : 'Security'}</h3><p>{ko ? '소프트웨어와 온라인 경험을 더 안전하고 회복력 있게 만드는 데 꾸준히 관심을 두고 있습니다.' : 'A continuing interest in making software and online experiences more resilient.'}</p></div><b aria-hidden="true">↗</b></article><article className="focus-item"><span>04</span><div><h3>{ko ? '오픈 소스' : 'Open source'}</h3><p>{ko ? '프로젝트와 도구를 공개적으로 나누고 커뮤니티와 창작자를 위한 것을 만듭니다.' : 'Sharing projects and tools in public, and building for communities and creators.'}</p></div><b aria-hidden="true">↗</b></article></div></section>
    <section className="build-section" id="build"><div className="build-head"><div><p className="eyebrow">05 / {ko ? '만드는 과정' : 'THE BUILD LOOP'}</p><h2>{ko ? <>유용하게 만들고.<br/><span className="lime">실제로 구현하기.</span></> : <>Make it useful.<br/><span className="lime">Make it real.</span></>}</h2></div><p>{ko ? '막연한 아이디어에서 사람들이 실제로 쓸 수 있는 결과물까지, 제가 되풀이하는 단계입니다.' : 'From a rough idea to something people can actually use—these are the steps I return to.'}</p></div><div className="build-layout"><div className="build-steps"><article className="build-step focus-item"><span>01</span><div><h3>{ko ? '진짜 문제 찾기' : 'Find the real problem'}</h3><p>{ko ? '사람들이 해야 하는 일에서 출발해 가장 작고 유용한 형태를 구상합니다.' : 'Start with what someone needs to do, then shape the smallest useful version.'}</p></div><b>↗</b></article><article className="build-step focus-item"><span>02</span><div><h3>{ko ? '명확한 기반 선택하기' : 'Choose a clear foundation'}</h3><p>{ko ? '목적에 맞는 도구를 쓰고 구성 요소를 이해하기 쉽게 유지합니다.' : 'Use the right tools for the job and keep the moving parts understandable.'}</p></div><b>↗</b></article><article className="build-step focus-item"><span>03</span><div><h3>{ko ? '만들고, 시험하고, 다듬기' : 'Build, test, refine'}</h3><p>{ko ? '아이디어를 작동하는 소프트웨어로 만들고, 동작을 살펴 배우며 계속 개선합니다.' : 'Turn the idea into working software, learn from how it behaves, and keep improving.'}</p></div><b>↗</b></article></div><div className="terminal-card" aria-label={ko ? '장식용 코드 예시' : 'Decorative code sample'}><div className="terminal-bar"><span><i/><i/><i/></span><span>{ko ? '아이디어.ts' : 'idea.ts'}</span><span>{ko ? '서울 / 대한민국' : 'SEOUL / KR'}</span></div><pre><code><span className="code-purple">const</span> <span className="code-blue">goodIdea</span> = {'{'}{`\n`}  problem: <span className="code-green">'worth solving'</span>,{`\n`}  tools: <span className="code-green">'fit the job'</span>,{`\n`}  mindset: <span className="code-green">'keep learning'</span>{`\n`}{'}'};{`\n\n`}<span className="code-purple">while</span> (curious) {'{'}{`\n`}  build(goodIdea);{`\n`}{'}'}</code></pre><div className="terminal-foot"><span>{ko ? '/* 새로운 아이디어를 계속 구현합니다 */' : '/* ALWAYS SHIPPING NEW IDEAS */'}</span><span className="terminal-cursor" aria-hidden="true"/></div></div></div></section>
    <section className="sites-section" id="sites"><div className="section-heading"><div><p className="eyebrow">06 / {ko ? '웹 곳곳에서' : 'AROUND THE WEB'}</p><h2>{ko ? <>인터넷의<br/>다른 공간들</> : <>More corners<br/>of the internet</>}<span className="lime">.</span></h2></div><p className="sites-note">{ko ? <>온라인에 공개한<br/>프로젝트와 공간입니다.</> : <>A selection of projects and places<br/>I’ve put online.</>}</p></div><div className="sites-grid">{sites.map((site,i)=><a href={`https://${site}`} key={site} target="_blank" rel="noreferrer"><span className="site-index">{String(i+1).padStart(2,'0')}</span><span>{site}</span><span className="site-arrow">↗</span></a>)}</div></section>
    <footer className="footer"><div className="footer-main"><div><p className="eyebrow">{ko ? '좋은 아이디어가 있으신가요?' : 'HAVE A GOOD ONE IN MIND?'}</p><h2>{ko ? <>함께<br/><span className="lime">현실로 만들어요.</span></> : <>Let’s make<br/>something <span className="lime">real.</span></>}</h2></div><a className="button button-lime footer-button" href="mailto:contact@rukkit.net">{ko ? 'Audest에게 이메일' : 'Email Audest'} <span>↗</span></a></div><div className="footer-bottom"><a className="wordmark" href="#top"><span className="wordmark-dot"/>AUDEST</a><span>{ko ? '호기심으로 만들었습니다 · 서울, 대한민국' : 'BUILT WITH CURIOSITY · SEOUL, KR'}</span><div><a href="https://github.com/3289david" target="_blank" rel="noreferrer">깃허브 ↗</a><a href="https://github.com/rukkitofficial" target="_blank" rel="noreferrer">조직 ↗</a><a href="mailto:contact@rukkit.net">이메일 ↗</a></div><span>© 2025 AUDEST</span></div></footer>
  </main>;
}
