import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronRight, ChevronDown,
  Heart, Gift, Home, Sparkles, Briefcase,
  Utensils, Flower2, Camera, Music, Flame, Bus,
  HelpCircle, Moon, Sun,
} from 'lucide-react';
import { Button } from '@shared/reusable';
import styles from './Header.module.css';

/** App-wide header. `variant="auth"` renders a slim header for auth pages. */
const EVENT_TYPES = [
  { icon: <Heart size={17} />, label: 'Weddings' },
  { icon: <Gift size={17} />, label: 'Birthdays' },
  { icon: <Home size={17} />, label: 'Housewarming' },
  { icon: <Sparkles size={17} />, label: 'Naming ceremony' },
  { icon: <Heart size={17} />, label: 'Anniversaries' },
  { icon: <Briefcase size={17} />, label: 'Corporate' },
];
const BY_SERVICE = [
  { icon: <Utensils size={17} />, label: 'Catering' },
  { icon: <Flower2 size={17} />, label: 'Decoration' },
  { icon: <Camera size={17} />, label: 'Photography' },
  { icon: <Music size={17} />, label: 'Music & Sound' },
  { icon: <Flame size={17} />, label: 'Priest / Pandit' },
  { icon: <Bus size={17} />, label: 'Transportation' },
];
const SIMPLE_LINKS = [
  { label: 'About Us', href: '#about' },
  { label: 'Blog', href: '#blog' },
  { label: 'For Organizers', href: '#organizers' },
];

export interface HeaderProps {
  variant?: 'default' | 'auth';
  authCta?: { prompt: string; label: string; to: string };
}

export function Header({ variant = 'default', authCta }: HeaderProps) {
  const cta = authCta ?? { prompt: 'New to Evently?', label: 'Create account', to: '/join' };
  const [dark, setDark] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link to="/" className={styles.logo}>
          <span className={styles.logoAccent}>e</span>
          <span>vently</span>
        </Link>

        {variant === 'auth' ? (
          <div className={styles.actions}>
            {/* The label is a <span> so the small-screen rule below can drop
                it and leave the icon — it used to be a bare text node, which
                that rule could not target, so the header overlapped itself on
                a phone. */}
            <a href="#help" className={styles.helpLink}>
              <HelpCircle size={18} />
              <span>Need help?</span>
            </a>
            <button
              type="button" className={styles.themeToggle}
              aria-label="Toggle theme" aria-pressed={dark}
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className={styles.vDivider} aria-hidden />
            <span className={styles.createWrap}>
              {/* Only the prompt collapses on a phone. The link itself stays:
                  on onboarding it is "Save & exit", the sole way out of the
                  wizard, and hiding the whole wrapper took that away. */}
              {cta.prompt ? <span className={styles.createPrompt}>{cta.prompt}</span> : null}
              <Link to={cta.to} className={styles.createLink}>{cta.label}</Link>
            </span>
          </div>
        ) : (
          <>
            <ul className={styles.links}>
              <li className={styles.exploreItem}>
                <button type="button" className={styles.exploreBtn} aria-haspopup="true">
                  Explore <ChevronDown size={15} strokeWidth={2.5} className={styles.caret} />
                </button>
                <div className={styles.dropdown} role="menu">
                  <div className={styles.megaPanel}>
                    <div className={styles.col}>
                      <p className={styles.eyebrow}><span className={styles.dash} />Event Types</p>
                      <ul className={styles.menuList}>
                        {EVENT_TYPES.map((it) => (
                          <li key={it.label}>
                            <a href="#explore" className={styles.menuItem} role="menuitem">
                              <span className={styles.menuIcon}>{it.icon}</span>{it.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.col}>
                      <p className={styles.eyebrow}><span className={styles.dash} />By Service</p>
                      <ul className={styles.menuList}>
                        {BY_SERVICE.map((it) => (
                          <li key={it.label}>
                            <a href="#explore" className={styles.menuItem} role="menuitem">
                              <span className={styles.menuIcon}>{it.icon}</span>{it.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.featured}>
                      <span className={styles.featuredPill}><Sparkles size={12} /> FEATURED</span>
                      <h3 className={styles.featuredTitle}>Plan anything,<br />celebrate anywhere</h3>
                      <p className={styles.featuredText}>Browse verified organizers across every celebration and service, all in one place.</p>
                      <Link to="/discover">
                        <Button variant="brand" size="sm">Explore now <ChevronRight size={16} /></Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
              {SIMPLE_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.link}>{link.label}</a>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button type="button" className={styles.search} aria-label="Search events and organizers">
                <Search size={16} aria-hidden />
                <span>Search events, organizers…</span>
                <kbd className={styles.kbd}>⌘K</kbd>
              </button>
              <Link to="/login" className={styles.login}>Log in</Link>
              {/* The planner is open to anonymous visitors — sign-in is asked
                  for at submit, in a dialog, so this must actually navigate. */}
              <Link to="/plan">
                <Button variant="brand" size="md">Plan Your Event <ChevronRight size={16} /></Button>
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
