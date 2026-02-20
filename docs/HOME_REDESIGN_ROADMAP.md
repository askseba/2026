# 🎯 Home Page Redesign - Technical Roadmap

## 1. Executive Summary
This document provides a comprehensive technical roadmap for the complete redesign of the **Ask Seba** Home Page (`/`). The goal is to implement a new Figma design with **zero impact** on the existing 40+ pages, maintaining full RTL (Arabic) compatibility and PWA functionality.

The strategy focuses on **Style Isolation** using a scoped CSS approach, **Component Duplication** for Home-specific versions of shared elements (like Header/Footer), and a **Surgical Implementation** plan that replaces only the root `page.tsx` while preserving all underlying business logic and data fetching.

---

## 2. Style Isolation Strategy
To ensure new styles do not "bleed" into other pages, we will use a **Scoped Wrapper** approach combined with Tailwind's arbitrary values and CSS Modules where necessary.

### **Method:**
1.  Wrap the entire content of `src/app/page.tsx` in a unique ID/Class: `<div id="home-redesign-root" className="home-redesign-scope">`.
2.  Use **Tailwind Arbitrary Values** for one-off design elements (e.g., `bg-[#F3E9E2]`).
3.  For complex custom CSS, use a **CSS Module**: `src/app/home.module.css`.

### **Example Code Snippet:**
```tsx
// src/app/page.tsx
import styles from './home.module.css';

export default function Home() {
  return (
    <div id="home-redesign-root" className={`home-redesign-scope ${styles.wrapper}`}>
      {/* New Figma Design Content Here */}
      <section className="bg-primary-light/10 p-[42px] md:p-20">
         <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold">...</h1>
      </section>
    </div>
  );
}
```

---

## 3. Component Inventory
The following elements must be preserved or re-implemented in the new design to maintain current functionality:

| Element | Current Location | Functionality | Designer Must Include? |
| :--- | :--- | :--- | :--- |
| **Main CTA Button** | `page.tsx` (Line 106) | Navigates to `/quiz` (Start Test) | **Yes (Critical)** |
| **Featured Perfumes** | `page.tsx` (Line 213) | Displays 3 perfumes via `getFeaturedPerfumes(3)` | **Yes** |
| **Social Proof Stats** | `page.tsx` (Line 17) | Displays 50K+ perfumes, 98% satisfaction, etc. | **Yes** |
| **Testimonials** | `page.tsx` (Line 165) | Carousel of user reviews from `content.json` | **Yes** |
| **Secondary CTA** | `page.tsx` (Line 176) | Final "Start Now" button at bottom | **Yes** |
| **Language/Dir** | `layout.tsx` | Must remain `lang="ar"` and `dir="rtl"` | **Yes** |

---

## 4. File Modification Plan

### **MODIFY:**
- `src/app/page.tsx`: Replace entire content with the new design.
- `src/components/ConditionalLayout.tsx`: Update to handle the new `HomeHeader`/`HomeFooter` if chosen.

### **CREATE / DUPLICATE:**
- `src/app/home.module.css`: For Home-only custom styles.
- `src/components/HomeHeader.tsx`: If the new design requires a transparent or different header.
- `src/components/HomeFooter.tsx`: If the new design requires a different footer layout.

### **DO NOT TOUCH:**
- `src/app/layout.tsx`: (Global providers and metadata).
- `src/app/(everything else)/*`: All other 40+ pages.
- `tailwind.config.ts`: Avoid changing global theme values to prevent breaking other pages.

---

## 5. Header/Footer Strategy
The current Header/Footer are managed via `ConditionalLayout.tsx`.

### **Recommendation: Option 2 (Home-only versions)**
**Pros:** Full creative freedom for the Home page without risking the rest of the site.  
**Cons:** Slight increase in maintenance if global links change.

**Implementation Example:**
```tsx
// src/components/ConditionalLayout.tsx
const isHomePage = pathname === '/';
const isAuthPage = pathname === '/login' || pathname === '/register';

return (
  <div className="flex flex-col min-h-screen">
    {!isAuthPage && (isHomePage ? <HomeHeader /> : <Header />)}
    <main>{children}</main>
    {!isAuthPage && (isHomePage ? <HomeFooter /> : <Footer />)}
  </div>
);
```

---

## 6. Technical Brief for Figma Designer

### **✅ Must-Haves:**
- **RTL First:** Design for Arabic text (Right-to-Left).
- **Responsive Breakpoints:** Provide designs for Mobile (375px), Tablet (768px), and Desktop (1440px).
- **Interactive States:** Show Hover, Active, and Loading states for all buttons.
- **Asset Export:** Export all icons as SVG and images as WebP/PNG.
- **Font Consistency:** Use `Noto Sans Arabic` and `Manrope` (current project fonts).

### **❌ Cannot-Haves:**
- **No New APIs:** Redesign must use existing data (Perfumes, Stats, Testimonials).
- **No Font Changes:** Stick to the defined font variables to avoid loading extra assets.
- **No Layout Shifts:** Ensure Hero section has a defined height to prevent CLS.

---

## 7. Integration Roadmap

### **Phase 1: Preparation (1-2 Days)**
- [ ] Audit `src/components/ui` for reusable components.
- [ ] Set up `home.module.css` and the scoped wrapper.

### **Phase 2: Implementation (3-5 Days)**
- [ ] Build the Hero section and CTA logic.
- [ ] Integrate `getFeaturedPerfumes` into the new grid.
- [ ] Implement the new Header/Footer (if applicable).

### **Phase 3: Testing & QA (2 Days)**
- [ ] Visual regression testing on 5 random other pages.
- [ ] Mobile responsiveness check on iOS/Android.
- [ ] PWA "Add to Home Screen" verification.

**Rollback Plan:** In case of critical failure, revert `src/app/page.tsx` using the backup created before implementation.

---

## 8. Risk Assessment

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **CSS Bleeding** | High | Use `home-redesign-scope` class and CSS Modules. |
| **Performance Drop** | Medium | Use `next/image` with proper `priority` and `sizes`. |
| **RTL Layout Breaks** | Medium | Use logical properties (e.g., `ms-4` instead of `ml-4`). |
| **Broken Navigation** | High | Reuse existing `Link` components and route paths. |

---

## 9. Final Recommendation: **GO**
The project structure is well-organized and uses modern Next.js patterns, making a surgical redesign of the Home page highly feasible and safe. By following the **Style Isolation** and **Component Duplication** strategies, we can achieve a fresh look with zero risk to the existing production environment.
