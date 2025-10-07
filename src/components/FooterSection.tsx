import { memo, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { useTheme } from './ThemeContext';
import { useAccessibility } from './AccessibilityProvider';

type NavigationLink = {
  label: string;
  href: string;
  description: string;
  external?: boolean;
};

type NavigationGroup = {
  heading: string;
  links: NavigationLink[];
};

type SocialLinkMeta = {
  name: string;
  href: string;
  day: string;
  night: string;
  tagline?: string;
};

type FloatingCloudMeta = {
  id: string;
  day: string;
  night: string;
  alt: string;
  position: string;
  size: string;
  sizes: string;
  driftX: string;
  driftY: string;
  duration: number;
  srcSetDay?: string;
  srcSetNight?: string;
};

type UtilityLink = {
  label: string;
  href: string;
  external?: boolean;
};

const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    heading: 'Navigate',
    links: [
      {
        label: 'Home',
        href: '/',
        description: '> step 0, where it all began',
      },
      {
        label: 'About us',
        href: '/about-us',
        description: '> learn who the hay we are',
      },
      {
        label: 'Log book',
        href: '/log-book',
        description: '> news and updates about all things Things',
      },
      {
        label: 'Contact',
        href: '/contact',
        description: '> say hi! we read every email',
      },
    ],
  },
  {
    heading: 'Our Things',
    links: [
      {
        label: 'Rooms',
        href: '/rooms',
        description: '> 3D, interactive rooms for iOS and web',
      },
      {
        label: 'A Bunch of Things',
        href: '/a-bunch-of-things',
        description: '> construct 3D scenes on Apple Vision Pro',
      },
    ],
  },
];

const SOCIAL_LINKS: SocialLinkMeta[] = [
  {
    name: 'Discord',
    href: 'https://discord.gg/rooms',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36059c82b1e5845d15655_footer_discord-day.svg',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3602a274968c5aa7bb8ff_footer_discord-night.svg',
    tagline: 'Pop into the Rooms community.',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@things',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36058d48d217d932d7ac5_footer_tiktok-day.svg',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36058957f8216930752e7_footer_tiktok-night.svg',
    tagline: 'Playful experiments in motion.',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/things_incorporated/',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f360582d624b679becc8a8_footer_instagram-day.svg',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3605861a90f310acdf217_footer_instagram-night.svg',
    tagline: 'Scenes from the build log.',
  },
  {
    name: 'X / Twitter',
    href: 'https://x.com/things',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36058b123ca59990b0d2c_footer_x-day.svg',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f360584e79b06365002187_footer_x-night.svg',
    tagline: 'Dispatches and release threads.',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@things-inc',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36059e1b812491915e08b_footer_youtube-day.svg',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f360594367a3be3f06f61a_footer_youtube-night.svg',
    tagline: 'Deep dives & demos.',
  },
  {
    name: 'Threads',
    href: 'https://www.threads.net/@things_incorporated?hl=en',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3605939c6b8addd616a6c_footer_threads-day.svg',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3609217acabd402d408dc_footer_threads-night.svg',
    tagline: 'Casual notes from the team.',
  },
];

const FLOATING_CLOUDS: FloatingCloudMeta[] = [
  {
    id: 'cloud-right',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367536d9cdf539095c9eb_footer-cloud-right_night.png',
    srcSetNight:
      'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367536d9cdf539095c9eb_footer-cloud-right_night-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367536d9cdf539095c9eb_footer-cloud-right_night.png 657w',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a804f8c9cd92a372ce_footer-cloud-right_day.png',
    srcSetDay:
      'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a804f8c9cd92a372ce_footer-cloud-right_day-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a804f8c9cd92a372ce_footer-cloud-right_day.png 657w',
    alt: 'Nova pillar cloud — guiding modern energy',
    position: 'top-8 right-2 sm:top-14 sm:right-8 lg:top-16 lg:right-16',
    size: 'w-28 sm:w-36 lg:w-48 h-auto',
    sizes: '(max-width: 768px) 220px, (max-width: 1200px) 280px, 320px',
    driftX: '26px',
    driftY: '-18px',
    duration: 28,
  },
  {
    id: 'cloud-top-left',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a85cb2687ca4e30838_footer-clouds-left_night.png',
    srcSetNight:
      'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a85cb2687ca4e30838_footer-clouds-left_night-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a85cb2687ca4e30838_footer-clouds-left_night.png 717w',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8274968c5aa82329f_footer-clouds-left_day.png',
    srcSetDay:
      'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8274968c5aa82329f_footer-clouds-left_day-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8274968c5aa82329f_footer-clouds-left_day.png 717w',
    alt: 'Zen pillar cloud — mindful calm',
    position: 'top-10 left-2 sm:top-16 sm:left-10 lg:top-20 lg:left-20',
    size: 'w-32 sm:w-40 lg:w-52 h-auto',
    sizes: '(max-width: 768px) 240px, (max-width: 1200px) 300px, 360px',
    driftX: '18px',
    driftY: '-12px',
    duration: 32,
  },
  {
    id: 'cloud-bottom-left',
    night: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8a723298ff33cee0f_footer-clouds-bottom_night.png',
    day: 'https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a805dd39bee16d5312_footer-clouds-bottom_day.png',
    alt: 'Informatika pillar cloud — intelligent motion',
    position: 'bottom-10 left-4 sm:bottom-16 sm:left-10 lg:bottom-20 lg:left-24',
    size: 'w-28 sm:w-36 lg:w-44 h-auto',
    sizes: '(max-width: 768px) 220px, (max-width: 1200px) 260px, 300px',
    driftX: '22px',
    driftY: '14px',
    duration: 30,
  },
];

const UTILITY_LINKS: UtilityLink[] = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Media Assets', href: '/assets' },
];

const FOOTER_PARTNER: UtilityLink = {
  label: 'Website by Psychoactive Studios',
  href: 'https://psychoactive.studio/',
  external: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = 'idle' | 'success' | 'error';

function FooterSection() {
  const { isDark } = useTheme();
  const { reducedMotion } = useAccessibility();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  useEffect(() => {
    if (status === 'idle') {
      return undefined;
    }

    const timer = window.setTimeout(() => setStatus('idle'), 6000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setEmail('');
  };

  const inputClasses = [
    'w-full rounded-full border px-4 py-3 text-sm md:text-base transition-all duration-300 focus-visible:outline-none focus-visible:ring-2',
    isDark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/60 focus-visible:border-pink-200/70 focus-visible:ring-pink-300/40'
      : 'bg-white border-indigo-200 text-slate-900 placeholder-slate-500 focus-visible:border-indigo-400/80 focus-visible:ring-indigo-300/60',
    status === 'error'
      ? isDark
        ? 'border-rose-400/70 focus-visible:border-rose-400/80 focus-visible:ring-rose-400/50'
        : 'border-rose-500 focus-visible:border-rose-400 focus-visible:ring-rose-400/60'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const linkClass = `group flex flex-col gap-1 transition-colors duration-300 ${
    isDark ? 'text-white/80 hover:text-white' : 'text-slate-800 hover:text-slate-950'
  }`;

  const arrowColor = isDark ? 'text-white/60' : 'text-slate-500';
  const descriptionClass = `text-xs uppercase leading-relaxed tracking-[0.35em] ${
    isDark ? 'text-white/40' : 'text-slate-500'
  }`;

  const labelClass = `text-xs font-semibold uppercase tracking-[0.35em] ${
    isDark ? 'text-white/50' : 'text-slate-500'
  }`;

  const currentYear = new Date().getFullYear();
  const message =
    status === 'success'
      ? 'You’re on the list! We’ll send you thoughtful Things soon.'
      : status === 'error'
      ? 'Please share a valid email address so the Things can find you.'
      : '';

  const feedbackClass = [
    'zen-footer-feedback',
    status === 'success' ? 'is-success' : '',
    status === 'error' ? 'is-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <footer className="zen-footer footer-wrap lazy-section relative z-20 isolate overflow-hidden py-16 md:py-20 lg:py-24">
      <div className="zen-footer__gradient" aria-hidden="true" />
      <div className="zen-footer__mist" aria-hidden="true" />
      <div className="zen-footer__stars" aria-hidden="true" />

      <div className="padding-global">
        <div className="container-xlarge">
          <h2 id="footer-heading" className="sr-only">
            Stay looped in with Things
          </h2>

          <div className="zen-footer__layout">
            <section
              id="newsletter"
              aria-labelledby="newsletter-heading"
              className="space-y-6"
            >
              <div className="space-y-3">
                <p className={`text-xs uppercase tracking-[0.4em] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  Newsletter
                </p>
                <h3
                  id="newsletter-heading"
                  className={`text-xl font-semibold tracking-tight md:text-2xl ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Stay up to date with all things Things
                </h3>
                <p
                  className={`max-w-xl text-sm leading-relaxed md:text-base ${
                    isDark ? 'text-white/70' : 'text-slate-600'
                  }`}
                >
                  Join our mailing list for playful release notes, behind-the-scenes logs, and tips for building collaborative worlds.
                </p>
              </div>

              <form
                aria-describedby="newsletter-feedback"
                className="flex flex-col gap-3 md:flex-row md:items-center"
                noValidate
                onSubmit={handleSubmit}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === 'error') {
                      setStatus('idle');
                    }
                  }}
                  aria-invalid={status === 'error'}
                  aria-describedby="newsletter-feedback"
                  placeholder="things@things.studio"
                  className={inputClasses}
                />
                <button
                  type="submit"
                  className="zen-footer-cta inline-flex min-w-[8rem] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300/60"
                >
                  Sign up
                </button>
              </form>

              <p id="newsletter-feedback" role="status" aria-live="polite" className={feedbackClass}>
                {message}
              </p>
            </section>

            <nav aria-labelledby="footer-navigation-heading" className="space-y-8">
              <h3 id="footer-navigation-heading" className="sr-only">
                Footer navigation
              </h3>
              <div className="grid gap-8 sm:grid-cols-2">
                {NAVIGATION_GROUPS.map((group) => (
                  <div key={group.heading} className="space-y-5">
                    <p className={labelClass}>{group.heading}</p>
                    <ul className="space-y-4">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className={linkClass}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noreferrer noopener' : undefined}
                          >
                            <span className="flex items-center gap-2 text-sm font-medium tracking-tight">
                              {link.label}
                              <svg
                                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${arrowColor}`}
                                viewBox="0 0 17 12"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 0 6.30559 0 6C0 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                            <span className={descriptionClass}>{link.description}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>

            <section aria-labelledby="footer-follow-heading" className="space-y-6">
              <div className="space-y-2">
                <p className={labelClass}>Follow us</p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  Stay close as we ship new toys, release experiments, and share community updates.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="zen-footer-card group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                        isDark ? 'bg-white/10' : 'bg-indigo-100'
                      }`}
                    >
                      <img
                        src={isDark ? social.night : social.day}
                        alt={`${social.name} icon`}
                        className="h-5 w-5"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                          isDark ? 'text-white group-hover:text-white' : 'text-slate-900 group-hover:text-slate-950'
                        }`}
                      >
                        {social.name}
                      </span>
                      {social.tagline ? (
                        <span className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                          {social.tagline}
                        </span>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <div
            className={`mt-12 flex flex-col gap-4 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm ${
              isDark ? 'border-white/15 text-white/60' : 'border-indigo-200 text-slate-600'
            }`}
          >
            <div>© Things Inc. {currentYear}</div>
            <div className="flex flex-wrap items-center gap-4">
              {UTILITY_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer noopener' : undefined}
                  className={`uppercase tracking-[0.3em] transition-colors duration-200 ${
                    isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs tracking-[0.2em] sm:text-sm">
              <span className={isDark ? 'text-white/60' : 'text-slate-600'}>Website by</span>
              <a
                href={FOOTER_PARTNER.href}
                target="_blank"
                rel="noreferrer"
                className={`underline transition-colors duration-200 ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {FOOTER_PARTNER.label.replace('Website by ', '')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {FLOATING_CLOUDS.map((cloud) => {
        const style = (reducedMotion
          ? {}
          : {
              animationDuration: `${cloud.duration}s`,
              '--zen-cloud-dx': cloud.driftX,
              '--zen-cloud-dy': cloud.driftY,
            }) as CSSProperties;

        return (
          <div key={cloud.id} className={`pointer-events-none absolute ${cloud.position}`} aria-hidden="true">
            <div className={!reducedMotion ? 'zen-cloud-drift' : undefined} style={style}>
              <img
                src={isDark ? cloud.night : cloud.day}
                srcSet={isDark ? cloud.srcSetNight : cloud.srcSetDay}
                sizes={cloud.sizes}
                alt={cloud.alt}
                className={`${cloud.size} opacity-70`}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        );
      })}
    </footer>
  );
}

export default memo(FooterSection);