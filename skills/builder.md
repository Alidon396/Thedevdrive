# 🛠️ BUILDER Agent — Development Playbook

## Mission
Rapidly build premium, responsive websites for clients using a modular component system. Target: deliver a complete site in 2-4 hours.

## Tech Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Backend/DB**: Supabase (auth, storage, database)
- **Hosting**: Vercel (free tier)
- **Fonts**: Google Fonts (Inter, Outfit, or Poppins)

## Template Library

### 1. Landing Page ($100-200)
- Hero section with CTA
- Features/services grid
- Testimonials
- Contact form (Supabase backend)
- Footer with socials
- **Build time: 1-2 hours**

### 2. Business Website 3-5 pages ($250-500)
- Home, About, Services, Contact, Gallery
- Navigation with mobile hamburger
- Animated sections (scroll reveals)
- Google Maps embed
- **Build time: 3-4 hours**

### 3. E-commerce Basic ($400-800)
- Product grid with filters
- Cart functionality
- Checkout flow
- Admin dashboard (Supabase)
- **Build time: 6-8 hours**

### 4. Redesign/Modernize ($150-350)
- Audit existing site
- Rebuild with modern stack
- Preserve content, upgrade design
- **Build time: 2-4 hours**

## Design System Defaults
```css
/* Color Palette — Sleek Dark Mode */
--bg-primary: #0a0a0f;
--bg-secondary: #13131a;
--accent: #6366f1;        /* Indigo */
--accent-glow: #818cf8;
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--success: #10b981;
--warning: #f59e0b;

/* Glass Effect */
backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## Component Conventions
- All components in `/src/components/`
- Use `cn()` utility for conditional classes
- Every component must be responsive (mobile-first)
- Use Framer Motion for animations
- All images optimized (WebP, lazy loaded)

## Quality Checklist
- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1440px)
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)
- [ ] All links functional
- [ ] Contact form working
- [ ] Favicon and meta tags set
- [ ] Open Graph tags for social sharing
