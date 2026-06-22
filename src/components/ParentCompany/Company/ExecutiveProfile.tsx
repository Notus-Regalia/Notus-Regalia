"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Founder } from '@/data/Company-data';

const LINKEDIN_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';
const INSTAGRAM_PATH = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';
const X_PATH = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z';
const GITHUB_PATH = 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12';

/* ─────────────────────────────────────────
   Dedicated executive profile — full page.
   Server-rendered so the bio, role, and credentials
   land in the initial HTML for search engines.
───────────────────────────────────────── */
export default function ExecutiveProfile({ founder, onBack }: { founder: Founder; onBack?: () => void }) {
  // Show every platform the founder has a field for (LinkedIn, X, IG, GitHub).
  // Links still set to the "#" placeholder render but stay muted and inert until
  // a real URL is added.
  const socials = [
    { label: 'LinkedIn',  href: founder.linkedin,  path: LINKEDIN_PATH },
    { label: 'X',         href: founder.x,         path: X_PATH },
    { label: 'Instagram', href: founder.instagram, path: INSTAGRAM_PATH },
    { label: 'GitHub',    href: founder.github,    path: GITHUB_PATH },
  ].filter((s): s is { label: string; href: string; path: string } => !!s.href);

  // Share the biography via the native share sheet; fall back to copying it.
  const shareBiography = async () => {
    const data = {
      title: `${founder.name} — ${founder.title}`,
      text: founder.bio,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${data.title}\n\n${founder.bio}${data.url ? `\n\n${data.url}` : ''}`);
      }
    } catch {
      /* user dismissed the share sheet, or it's unsupported — ignore */
    }
  };

  // Download the portrait image to the user's device.
  const downloadImage = async () => {
    if (!founder.src) return;
    const ext = (founder.src.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
    try {
      const res = await fetch(founder.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${founder.slug}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(founder.src, '_blank', 'noopener,noreferrer');
    }
  };

  // Drives the cursor-following gradient border on the brand (hero) button.
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <main className="ep-root">
      <style>{`
        .ep-root{
          position:relative;min-height:100dvh;background:#000;color:#f1f5f9;
          overflow:hidden;
        }
        .ep-grid{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 112px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 112px);
          background-size:112px 112px;background-position:center;opacity:.35;
          mask-image:linear-gradient(to bottom,black,transparent 70%);
          -webkit-mask-image:linear-gradient(to bottom,black,transparent 70%);
        }
        .ep-glow{
          position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse at 78% 6%, rgba(227,27,84,0.12) 0%, transparent 55%);
        }
        .ep-wrap{
          position:relative;z-index:1;max-width:1480px;margin:0 auto;
          padding:clamp(5.5rem,11vh,8rem) clamp(1.4rem,5vw,5rem) 6rem;
        }
        .ep-back{
          display:inline-flex;align-items:center;gap:.5rem;
          font-family:ui-monospace,Menlo,monospace;font-size:.62rem;letter-spacing:.18em;
          text-transform:uppercase;color:rgba(255,255,255,.45);text-decoration:none;
          background:none;border:0;padding:0;cursor:pointer;
          transition:color .25s ease;margin-bottom:3rem;
        }
        .ep-back:hover{color:#fff;}
        .ep-layout{display:grid;grid-template-columns:minmax(320px,380px) 1fr;gap:clamp(2rem,5vw,5.5rem);align-items:start;}
        .ep-aside{display:flex;flex-direction:column;}
        .ep-portrait{
          position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;border-radius:14px;
          border:1px solid rgba(255,255,255,.10);
          background:linear-gradient(170deg,#0a0a0a 0%,#101010 100%);
        }
        .ep-portrait .ep-dot{
          position:absolute;inset:0;
          background-image:radial-gradient(circle, rgba(227,27,84,.15) 1px, transparent 1px);
          background-size:22px 22px;
        }
        .ep-chip{
          position:absolute;top:14px;left:14px;z-index:2;
          font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.16em;
          text-transform:uppercase;color:rgba(255,255,255,.7);
          background:rgba(0,0,0,.65);backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.15);padding:5px 11px;border-radius:4px;
        }
        .ep-eyebrow{
          display:inline-flex;align-items:center;gap:.55rem;
          font-family:ui-monospace,Menlo,monospace;font-size:.65rem;letter-spacing:.22em;
          text-transform:uppercase;font-weight:700;color:rgba(255,255,255,.40);margin-bottom:1.1rem;
        }
        .ep-eyebrow-dot{width:5px;height:5px;border-radius:50%;background:#E31B54;flex-shrink:0;}
        .ep-name{
          font-size:clamp(2rem,4.4vw,3.2rem);font-weight:700;letter-spacing:-.03em;line-height:1.05;margin:0;
          background:linear-gradient(135deg,#f1f5f9 0%,rgba(241,245,249,.6) 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .ep-title{
          font-family:ui-monospace,Menlo,monospace;font-size:.8rem;color:#E31B54;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;margin:.9rem 0 0;
        }
        .ep-divider{
          width:100%;height:1px;margin:2rem 0;
          background:linear-gradient(90deg, rgba(227,27,84,.3), rgba(255,255,255,.06) 50%, transparent);
        }
        .ep-section-label{
          display:block;font-family:ui-monospace,Menlo,monospace;font-size:.6rem;
          text-transform:uppercase;letter-spacing:.22em;color:rgba(255,255,255,.30);margin-bottom:.85rem;
        }
        .ep-bio{font-size:1.05rem;line-height:1.95;color:rgba(255,255,255,.62);margin:0;max-width:82ch;text-align:justify;text-justify:inter-word;hyphens:auto;}
        .ep-bio + .ep-bio{margin-top:1.25rem;}
        .ep-socials{display:flex;gap:.65rem;margin-top:1.6rem;flex-wrap:wrap;}
        /* Share / Download — the site's hero brand button, full-width + stacked.
           The gradient border follows the cursor via --mouse-x / --mouse-y. */
        .ep-actions{display:flex;flex-direction:column;gap:.7rem;margin-top:1.6rem;}
        .ep-cta{
          --btn-surface:radial-gradient(ellipse at bottom, rgba(255,255,255,1) 0%, rgba(226,229,233,1) 48%);
          --btn-text:rgba(0,0,0,0.66);
          --btn-text-hover:rgba(0,0,0,1);
          --btn-inset:rgba(0,0,0,0.12);
          --btn-line:linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%);
          position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.55rem;
          width:100%;padding:13px 20px;border:0;border-radius:7px;
          font-size:.9rem;font-weight:500;line-height:1;cursor:pointer;
          box-shadow:inset 0 0 0 1px var(--btn-inset);
          background:var(--btn-surface);color:var(--btn-text);
          transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s cubic-bezier(.22,1,.36,1),color .35s ease;
        }
        /* Secondary — always jet black (the non-CTA), matching the hero. */
        .ep-cta-secondary{
          --btn-surface:#1f1f1f;
          --btn-text:rgba(255,255,255,0.66);
          --btn-text-hover:rgba(255,255,255,1);
          --btn-inset:rgba(255,255,255,0.28);
          --btn-line:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
        }
        .ep-cta > *{position:relative;z-index:1;}
        .ep-cta svg{flex-shrink:0;}
        .ep-cta::before{
          content:'';width:70%;height:1px;position:absolute;bottom:0;left:15%;
          background:var(--btn-line);opacity:.2;transition:opacity .35s ease;
        }
        .ep-cta:hover{
          color:var(--btn-text-hover);transform:translateY(-2px);
          box-shadow:inset 0 0 0 1px var(--btn-inset),0 6px 18px -6px rgba(0,0,0,0.45);
        }
        .ep-cta:hover::before{opacity:1;}
        /* Cursor-following multicolor border */
        .ep-cta::after{
          content:'';position:absolute;inset:-1.5px;border-radius:8.5px;padding:1px;
          background:radial-gradient(180px circle at var(--mouse-x,50%) var(--mouse-y,50%),
            rgba(0,255,166,0.9),rgba(255,215,0,0.7),rgba(236,72,153,0.7),rgba(147,51,234,0.6),rgba(59,130,246,0.5),transparent 70%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;
          opacity:0;transition:opacity .3s ease;pointer-events:none;z-index:0;
        }
        .ep-cta:hover::after{opacity:1;}
        .ep-social{
          width:42px;height:42px;border-radius:50%;
          border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:rgba(255,255,255,.6);
          display:inline-flex;align-items:center;justify-content:center;text-decoration:none;
          transition:border-color .25s ease,color .25s ease,background .25s ease,transform .25s ease;
        }
        .ep-social:hover{border-color:rgba(227,27,84,.6);color:#fff;background:rgba(227,27,84,.12);transform:translateY(-1px);}
        /* LinkedIn — solid black fill, white mark */
        .ep-social-linkedin{background:#000;border-color:rgba(255,255,255,.28);color:#fff;}
        .ep-social-linkedin:hover{background:#000;border-color:#fff;color:#fff;transform:translateY(-1px);}
        /* Placeholder ("#") — visible but muted and inert until a real URL is set */
        .ep-social-pending{opacity:.4;cursor:default;}
        .ep-social-pending:hover{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:rgba(255,255,255,.6);transform:none;}
        @media(max-width:767px){
          .ep-layout{grid-template-columns:1fr;gap:2rem;}
          .ep-aside{max-width:320px;}
          .ep-bio{font-size:1rem;}
        }
      `}</style>

      <div className="ep-grid" />
      <div className="ep-glow" />

      <div className="ep-wrap">
        {onBack ? (
          <button type="button" onClick={onBack} className="ep-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="m15 18-6-6 6-6" /></svg>
            Back to Executives
          </button>
        ) : (
          <Link href="/company/executives" className="ep-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="m15 18-6-6 6-6" /></svg>
            Back to Executives
          </Link>
        )}

        <div className="ep-layout">
          {/* Portrait + socials */}
          <div className="ep-aside">
            <div className="ep-portrait">
              {founder.src ? (
                <Image src={founder.src} alt={founder.name} fill priority style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 767px) 280px, 340px" />
              ) : (
                <div className="ep-dot" />
              )}
              <span className="ep-chip">Since {founder.since}</span>
            </div>

            {socials.length > 0 && (
              <div className="ep-socials">
                {socials.map(s => {
                  const pending = s.href === '#';
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      {...(pending
                        ? { 'aria-disabled': true, onClick: (e: React.MouseEvent) => e.preventDefault() }
                        : { target: '_blank', rel: 'noopener noreferrer' })}
                      aria-label={s.label}
                      className={`ep-social${s.label === 'LinkedIn' && !pending ? ' ep-social-linkedin' : ''}${pending ? ' ep-social-pending' : ''}`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d={s.path} /></svg>
                    </a>
                  );
                })}
              </div>
            )}

            <div className="ep-actions">
              <button type="button" className="ep-cta" onClick={shareBiography} onMouseMove={handleMouseMove}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
                <span>Share Biography</span>
              </button>
              {founder.src && (
                <button type="button" className="ep-cta ep-cta-secondary" onClick={downloadImage} onMouseMove={handleMouseMove}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                  <span>Download Image</span>
                </button>
              )}
            </div>
          </div>

          {/* Detail */}
          <div>
            <div className="ep-eyebrow"><span className="ep-eyebrow-dot" />{founder.role}</div>
            <h1 className="ep-name">{founder.name}</h1>
            <p className="ep-title">{founder.title}</p>

            <div className="ep-divider" />

            <section>
              <span className="ep-section-label">About</span>
              {founder.bio.split('\n\n').map((paragraph, i) => (
                <p key={i} className="ep-bio">{paragraph}</p>
              ))}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
