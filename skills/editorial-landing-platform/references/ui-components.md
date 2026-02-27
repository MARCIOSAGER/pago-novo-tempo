# UI Components Reference

Reusable component patterns for editorial landing pages. Adapt colors, fonts, and content to your project's design system.

## Table of Contents

1. [Navbar — Scroll-Aware with Mobile Drawer](#navbar)
2. [Footer — Multi-Column with Legal Links](#footer)
3. [Flip Cards — 3D Hover Reveal](#flip-cards)
4. [Cookie Banner — LGPD Compliant](#cookie-banner)
5. [CTA Form — With Honeypot and LGPD Consent](#cta-form)

---

## Navbar

Scroll-aware navbar that transitions from transparent (over hero) to solid background. Includes mobile hamburger drawer with Framer Motion.

**Dependencies:** `framer-motion`, `lucide-react`

**Key patterns:**
- `useState` + `useEffect` for scroll detection (`window.scrollY > 60`)
- Transparent bg on hero → solid bg with backdrop-blur on scroll
- Mobile drawer with `AnimatePresence` for smooth enter/exit
- CTA button in nav for primary conversion action

```tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LOGO_URL = "YOUR_CDN_LOGO_URL";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-warm-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              <div className="hidden sm:block">
                <span className="font-display text-xl font-semibold text-navy tracking-wide">
                  Brand Name
                </span>
                <span className="block font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted">
                  Tagline
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-accent text-xs uppercase tracking-[0.2em] text-navy/70 hover:text-navy transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#cta"
                className="font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-6 py-3 hover:bg-navy-light transition-colors duration-300"
              >
                Get Started
              </a>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-navy p-2"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-warm-white pt-24 px-8"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl text-navy hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#cta"
                onClick={() => setMobileOpen(false)}
                className="font-accent text-sm uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 text-center"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Customization points:**
- Replace `bg-warm-white/95` with your light bg color for scrolled state
- Replace `bg-transparent` with gradient if hero has mixed contrast
- Adjust `h-20` for navbar height, `scrollY > 60` for trigger threshold
- Add `backdrop-blur-md` intensity as needed

---

## Footer

Multi-column footer with brand, navigation, feature summary, contact, legal links, and closing quote. Uses wouter `Link` for internal legal pages.

**Dependencies:** `wouter`

**Key patterns:**
- 12-column grid (`lg:grid-cols-12`) for flexible column widths
- Legal links row with `Link` from wouter for SPA navigation
- Gold divider line separating content from legal section
- Subtle opacity hierarchy: gold labels → 40% body text → 30% copyright → 20% quote

```tsx
import { Link } from "wouter";

const LOGO_URL = "YOUR_CDN_LOGO_URL";

export default function Footer() {
  return (
    <footer className="bg-navy py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand — 4 cols */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <span className="font-display text-xl font-semibold text-warm-white">Brand</span>
                <span className="block font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                  Tagline
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-warm-white/40 leading-relaxed max-w-sm">
              Brief description of the platform or mission.
            </p>
          </div>

          {/* Navigation — 2 cols */}
          <div className="lg:col-span-2">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Navigation
            </p>
            <div className="space-y-3">
              {[
                { label: "About", href: "#about" },
                { label: "Features", href: "#features" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block font-body text-sm text-warm-white/40 hover:text-warm-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Features Summary — 3 cols */}
          <div className="lg:col-span-3">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Features
            </p>
            <div className="space-y-3">
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">1</span> — Feature One
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">2</span> — Feature Two
              </p>
            </div>
          </div>

          {/* Contact — 3 cols */}
          <div className="lg:col-span-3">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Contact
            </p>
            <div className="space-y-3">
              <a href="#cta" className="block font-body text-sm text-warm-white/40 hover:text-warm-white transition-colors">
                Sign Up
              </a>
              <p className="font-body text-sm text-warm-white/40">email@example.com</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="gold-line mb-8" />

        {/* Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-warm-white/30">
            &copy; {new Date().getFullYear()} Brand. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors">
              Cookies
            </Link>
          </div>
        </div>

        {/* Closing Quote */}
        <div className="text-center">
          <p className="font-body text-[11px] text-warm-white/20 italic">
            "Your inspirational closing quote here."
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Customization points:**
- Adjust `lg:col-span-*` values to rebalance columns
- Replace `gold-line` CSS class with your divider style (defined in index.css)
- Add social media icons in the Contact column using lucide-react

---

## Flip Cards

3D flip cards that reveal additional content on hover (desktop) or tap (mobile). Uses CSS `perspective` + `rotateY(180deg)` with React state.

**Dependencies:** none (pure React + CSS)

**Critical implementation notes:**
- Use **inline styles** for `transition`, `transform`, `transformStyle`, and `backfaceVisibility` — Tailwind 4 classes like `duration-600` may not compile correctly
- Use `perspective: "800px"` on the outer container
- Front and back faces use `position: absolute; inset: 0; backfaceVisibility: "hidden"`
- Back face needs additional `transform: "rotateY(180deg)"` in its default state
- Mobile: use `onTouchStart` with toggle pattern instead of hover

```tsx
import { useState } from "react";

interface FlipCardProps {
  letter: string;
  title: string;
  subtitle: string;
  description: string;
}

const cardData = [
  {
    letter: "P",
    title: "Principle",
    subtitle: "Above\nresults",
    description: "True prosperity is measured by faithfulness to immutable foundations.",
  },
  {
    letter: "A",
    title: "Alignment",
    subtitle: "Generates\nauthority",
    description: "When belief, feeling, and action align, transcendent authority emerges.",
  },
  // Add more cards...
];

function FlipCard({ letter, title, subtitle, description }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-44 sm:h-48 cursor-pointer"
      style={{ perspective: "800px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onTouchStart={() => setFlipped((prev) => !prev)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.6s ease",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Face */}
        <div
          className="flex flex-col items-center justify-center p-5 border border-sand-dark/30 bg-warm-white"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="font-display text-5xl font-bold text-gold/30 leading-none select-none"
            style={{ position: "absolute", top: "8px", right: "12px" }}
          >
            {letter}
          </span>
          <p className="font-display text-2xl sm:text-3xl font-semibold text-navy mb-2">
            {title}
          </p>
          <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-blue-muted text-center whitespace-pre-line">
            {subtitle}
          </p>
        </div>

        {/* Back Face */}
        <div
          className="flex flex-col items-center justify-center p-5 bg-navy border border-gold/20"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span
            className="font-display text-5xl font-bold text-gold/20 leading-none select-none"
            style={{ position: "absolute", top: "8px", right: "12px" }}
          >
            {letter}
          </span>
          <p className="font-display text-lg font-semibold text-gold mb-3">
            {title}
          </p>
          <p className="font-body text-xs text-warm-white/80 leading-relaxed text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Usage in a grid:
export function FlipCardGrid() {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {cardData.map((card) => (
          <FlipCard key={card.letter} {...card} />
        ))}
      </div>
      <p className="font-accent text-[9px] uppercase tracking-[0.2em] text-blue-muted/50 text-center mt-3">
        Hover to reveal
      </p>
    </>
  );
}
```

**Customization points:**
- Adjust `h-44 sm:h-48` for card height
- Change `perspective: "800px"` for more/less dramatic 3D effect
- Swap `rotateY` for `rotateX` for vertical flip
- Adjust `transition: "transform 0.6s ease"` for speed (0.4s = snappy, 0.8s = elegant)
- Front/back colors: swap `bg-warm-white`/`bg-navy` for your palette

---

## Cookie Banner

LGPD-compliant floating cookie consent banner with three options. Stores consent in `localStorage`.

**Key patterns:**
- Show only on first visit (check `localStorage`)
- Three buttons: Accept All, Essential Only, View Details
- Fixed position bottom-center with backdrop blur
- Link to Privacy Policy and Cookie Policy pages

```tsx
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem("cookie-consent", level);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-lg z-50
                    bg-navy/95 backdrop-blur-md rounded-lg p-6 shadow-2xl border border-gold/10">
      <h3 className="font-accent text-sm font-semibold text-warm-white mb-2">
        We respect your privacy
      </h3>
      <p className="font-body text-xs text-warm-white/60 leading-relaxed mb-4">
        We use cookies to improve your experience. Essential cookies are required
        for basic functionality. Performance cookies help us understand usage anonymously.
      </p>
      <div className="flex flex-wrap gap-3 mb-3">
        <button
          onClick={() => accept("all")}
          className="font-accent text-[10px] uppercase tracking-[0.15em] bg-gold text-navy px-4 py-2 hover:bg-gold/90 transition-colors"
        >
          Accept All
        </button>
        <button
          onClick={() => accept("essential")}
          className="font-accent text-[10px] uppercase tracking-[0.15em] border border-warm-white/30 text-warm-white px-4 py-2 hover:bg-warm-white/10 transition-colors"
        >
          Essential Only
        </button>
      </div>
      <p className="font-body text-[10px] text-warm-white/40">
        Learn more in our{" "}
        <a href="/cookies" className="underline hover:text-gold">Cookie Policy</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-gold">Privacy Policy</a>.
      </p>
    </div>
  );
}
```

---

## CTA Form

Enrollment form with honeypot anti-bot field, LGPD consent checkbox, and tRPC mutation integration.

**Key patterns:**
- Hidden honeypot field (`website`) — if filled by bots, submission is silently discarded
- Required LGPD consent checkbox before submit
- Uses `trpc.mentoria.submit.useMutation()` for type-safe submission
- Success/error toast feedback

```tsx
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function CTAForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "", website: "", lgpdConsent: false,
  });

  const submit = trpc.mentoria.submit.useMutation({
    onSuccess: () => {
      alert("Submitted successfully!");
      setForm({ name: "", email: "", phone: "", message: "", website: "", lgpdConsent: false });
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lgpdConsent) return alert("Please accept the privacy terms.");
    submit.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        placeholder="Full Name *"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-full bg-transparent border-b border-sand-dark/30 py-3 font-body text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none"
      />
      <input
        type="email"
        placeholder="Email *"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="w-full bg-transparent border-b border-sand-dark/30 py-3 font-body text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full bg-transparent border-b border-sand-dark/30 py-3 font-body text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none"
      />
      <textarea
        placeholder="Message (optional)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={3}
        className="w-full bg-transparent border-b border-sand-dark/30 py-3 font-body text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none resize-none"
      />

      {/* Honeypot — hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      {/* LGPD Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.lgpdConsent}
          onChange={(e) => setForm({ ...form, lgpdConsent: e.target.checked })}
          className="mt-1 accent-gold"
        />
        <span className="font-body text-xs text-navy/60 leading-relaxed">
          I agree to the <a href="/privacy" className="underline text-gold">Privacy Policy</a> and
          consent to the processing of my personal data as described therein. *
        </span>
      </label>

      <button
        type="submit"
        disabled={submit.isPending}
        className="w-full bg-navy text-warm-white font-accent text-sm uppercase tracking-[0.2em] py-4 hover:bg-navy-light transition-colors disabled:opacity-50"
      >
        {submit.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

**Customization points:**
- Add more fields as needed (dropdown, file upload, etc.)
- Replace `alert()` with shadcn/ui `toast` for better UX
- Adjust honeypot field name (`website` is common, but any unused name works)
- Style the consent checkbox with your accent color
