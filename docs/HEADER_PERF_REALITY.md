# Header Performance Reality Check (Read-Only)

**Goal:** Factual evidence of what the header costs in JS/CSS, focusing on client boundary and framer-motion.  
**Method:** Existing `.next` build artifacts (client-reference manifests, entryJSFiles, ssrModuleMapping, chunk content). No code changes. No recommendations.

**Note:** `npm run build` was not re-run in this environment. Evidence below is from the existing `.next` output (Turbopack/Next.js 16). For fresh route sizes and any build warnings, run `npm run build` locally and capture the terminal output.

---

## 1. What loads on first paint

For a page that uses the root layout (e.g. `/ar` or `/en` home), the **layout** entry determines the initial JS/CSS. From `.next/server/app/[locale]/page_client-reference-manifest.js`:

### 1.1 JS (entryJSFiles for `[project]/src/app/layout`)

The root layout loads these client chunks (all synchronous, `async: false`):

| Chunk filename | Note |
|----------------|------|
| `static/chunks/d7401c695ee542a9.js` | — |
| `static/chunks/a88873f71fe06c44.js` | — |
| `static/chunks/509a78c63b7911c2.js` | — |
| `static/chunks/38731aa1aef7028b.js` | — |
| `static/chunks/2610d28ea60d8346.js` | — |
| `static/chunks/e591165d6d3e1973.js` | — |
| `static/chunks/c8918fa904635122.js` | — |
| `static/chunks/9dae70bbc12a4253.js` | — |
| `static/chunks/a519c563f77e93c8.js` | Contains next-themes, next-auth (SessionProvider, useSession, signOut), Radix primitives, Button (with motion), ConditionalLayout, Header, Footer, ErrorBoundary, NetworkStatusToast, PWARegister, QuizProvider, PostHogProviderWrapper, SentryLazyExtras, etc. |

For **`[project]/src/app/[locale]/page`** (home), the same layout chunks plus one more:

- `static/chunks/e249c7eebee8f6c2.js` (page-specific: HeroSection, QuestionsSection, CTASection, StatsSection, BenefitsSection, HeadlineSection, ValuePropSection, next-intl BaseLink).

So on first paint of `/ar` or `/en`: the **9 layout chunks** above are loaded, plus the **1 home page chunk** and the shared framework chunks (`bebec169d5a141b0.js`, `ebe94f77d09738d4.js`).

### 1.2 CSS (entryCSSFiles)

From the same manifest, `entryCSSFiles` for layout and `[locale]/page`:

- `static/chunks/a48bf96f2eb4d4fd.css`
- `static/chunks/3c471c682dcfcf37.css`

---

## 2. What is client-only because of the header

### 2.1 Client boundary

- **Root layout** (`src/app/layout.tsx`) is a Server Component but renders **ConditionalLayout** (client). ConditionalLayout is in the same client bundle as the layout tree: SessionProvider, QuizProvider, next-themes, Toaster, NetworkStatusToast, PWARegister, ErrorBoundary, PostHogProviderWrapper, SentryLazyExtras, and **ConditionalLayout** (which renders **Header** and **Footer**).
- **Header** (`src/components/ui/header.tsx`) is a client component. It is **not** in a separate async chunk; it is part of the layout client bundle (ConditionalLayout imports Header, and both are listed in the same `clientModules` with the same chunk set: `d7401c695ee542a9.js` … `a519c563f77e93c8.js`).
- Because the **layout** wraps every non-auth route, any route that shows the header (all except login, register, forgot-password) receives the **same** layout JS. So there is no “header-only” route: the header is part of the shared layout client bundle.

### 2.2 What the header pulls in (source-level)

From `src/components/ui/header.tsx` and its dependencies:

| Dependency | Used by | Client-only? |
|------------|---------|----------------|
| `next-auth/react` (useSession, signOut) | header.tsx | Yes — in layout bundle |
| `@/components/landing/StatusCircles` | header.tsx | Yes |
| `framer-motion` (motion) | StatusCircles.tsx | Yes — only header subtree that imports framer-motion |
| `next-themes` (useTheme) | DarkModeToggle.tsx (used by header) | Yes — in layout bundle |
| `next-intl` (useTranslations), `@/i18n/routing` (useRouter) | header.tsx, LanguageSwitcher | Yes |
| `@/components/ui/button`, `@/components/ui/dropdown-menu` | header.tsx, LanguageSwitcher | Yes |
| `@/components/AskSebaIcons` (NotificationBellIcon, UserAvatarIcon) | header.tsx | Yes |
| `lucide-react` (Heart in StatusCircles, Globe in LanguageSwitcher) | StatusCircles, LanguageSwitcher | Yes |

So **because the header is in the layout**:

- **next-auth/react** is in the layout client bundle (SessionProvider is also there for the whole app; header’s useSession/signOut add to the same dependency set).
- **framer-motion** is in the layout client bundle via **StatusCircles** (StatusCircles imports `motion` from `framer-motion`; Header imports StatusCircles). The Button component (used by header) also uses `motion` from framer-motion in this codebase.
- **Header itself** is not in a separate chunk; it is part of the same set of chunks as ConditionalLayout and the rest of the layout client tree.

### 2.3 Chunks that include header / framer-motion / next-auth

- **From client manifest:** ConditionalLayout (and thus Header) is in chunks: `d7401c695ee542a9.js`, `a88873f71fe06c44.js`, `509a78c63b7911c2.js`, `38731aa1aef7028b.js`, `2610d28ea60d8346.js`, `e591165d6d3e1973.js`, `c8918fa904635122.js`, `9dae70bbc12a4253.js`, `a519c563f77e93c8.js`.
- **From ssrModuleMapping** (server dependency chain for the client layout script):  
  `server/chunks/ssr/src_components_ui_header_tsx_95748c02._.js` and  
  `server/chunks/ssr/node_modules_framer-motion_dist_es_render_components_motion_proxy_mjs_b72b0714._.js`  
  appear in the same dependency chain (script.js → … → header, framer-motion). So the **client** layout bundle that references the header also depends on framer-motion (used by StatusCircles and by Button).
- **next-auth:** In the built client chunk `a519c563f77e93c8.js`, the minified code contains next-auth logic (SessionProvider, useSession, signOut, getSession, signin/signout URLs, BroadcastChannel "next-auth"). So **next-auth/react** is present in the layout client bundle loaded on first paint.

---

## 3. Evidence excerpts

### 3.1 Layout client modules (ConditionalLayout and Header)

From `.next/server/app/[locale]/page_client-reference-manifest.js` (clientModules):

```text
"[project]/src/components/ConditionalLayout.tsx" (id 246301): chunks ["/_next/static/chunks/d7401c695ee542a9.js", ... "/_next/static/chunks/a519c563f77e93c8.js"], "async": false
```

ConditionalLayout imports and renders Header; both are in the same chunk set (no separate header chunk).

### 3.2 entryJSFiles for root layout

From the same file, `entryJSFiles`:

```json
"[project]/src/app/layout": [
  "static/chunks/d7401c695ee542a9.js",
  "static/chunks/a88873f71fe06c44.js",
  "static/chunks/509a78c63b7911c2.js",
  "static/chunks/38731aa1aef7028b.js",
  "static/chunks/2610d28ea60d8346.js",
  "static/chunks/e591165d6d3e1973.js",
  "static/chunks/c8918fa904635122.js",
  "static/chunks/9dae70bbc12a4253.js",
  "static/chunks/a519c563f77e93c8.js"
]
```

### 3.3 ssrModuleMapping (script.js dependency chain)

From the same manifest, the client layout script (479520) has ssrModuleMapping that includes:

```text
"server/chunks/ssr/node_modules_@radix-ui_c0ffc1e0._.js"
"server/chunks/ssr/node_modules_7f682f29._.js"
"server/chunks/ssr/_48a26f5a._.js"
"server/chunks/ssr/node_modules_@radix-ui_react-popper_dist_index_mjs_0d6fc757._.js"
"server/chunks/ssr/src_components_ui_header_tsx_95748c02._.js"
"server/chunks/ssr/[root-of-the-server]__a86fad45._.js"
"server/chunks/ssr/node_modules_next_dist_852965c2._.js"
"server/chunks/ssr/node_modules_framer-motion_dist_es_render_components_motion_proxy_mjs_b72b0714._.js"
...
"server/chunks/ssr/node_modules_sonner_dist_index_mjs_1addfdea._.js"
```

So **header** (`src_components_ui_header_tsx_95748c02._.js`) and **framer-motion** (`node_modules_framer-motion_dist_es_render_components_motion_proxy_mjs_b72b0714._.js`) are in the same client layout dependency chain.

### 3.4 Chunk content (a519c563f77e93c8.js)

In `.next/static/chunks/a519c563f77e93c8.js` (minified), the following are present (from grep and read of chunk content):

- **next-themes:** ThemeProvider, useTheme, attribute "class", storageKey, enableSystem.
- **next-auth:** SessionProvider, useSession, signOut, getSession, signin/signout URLs, CSRF, BroadcastChannel "next-auth", session context.
- **ConditionalLayout:** Pathname check, `["/login","/register","/forgot-password"]`, render of Header default export (`n.default`) and Footer.
- **Button:** Uses `l.motion.div` (framer-motion) for wrap; CVA variants (ghost, sm, etc.).
- **lucide-react:** Heart, Loader2, Mail, etc. (icons used by header subtree and others).
- **Radix:** Collection/slot primitives (dropdown-menu dependency chain).

### 3.5 Build manifest (root)

From `.next/build-manifest.json`:

```json
"rootMainFiles": [
  "static/chunks/47d18eaa6b28f0c4.js",
  "static/chunks/6b4c0d629b365068.js",
  "static/chunks/eeb71982caea182b.js",
  "static/chunks/03a5fc75fcbaa3ed.js",
  "static/chunks/9b27a6f5ad17a51f.js",
  "static/chunks/turbopack-4514402bbf0cb4c1.js"
]
```

Polyfill: `static/chunks/a6dad97d9634a72d.js`.  
Layout-specific client chunks are listed in the page client-reference-manifest `entryJSFiles` as above; they are loaded when the layout (and thus the header) is used.

### 3.6 Grep: chunks containing header / framer-motion / next-auth

Chunks that reference header, ConditionalLayout, StatusCircles, framer-motion, or next-auth (from grep in `.next/static/chunks/*.js`):

- `a519c563f77e93c8.js` (ConditionalLayout, next-auth, next-themes, Button with motion, Footer, etc.)
- `365bdbe723428b9a.js`, `9b27a6f5ad17a51f.js`, `c352adbf5cad7353.js`, `a88873f71fe06c44.js`, `a6dad97d9634a72d.js`, `e591165d6d3e1973.js`, `6189a3edf4f8dbfd.js`, `430c8f6932cd1ca2.js`, `a46f7ff2ecff6d0d.js`, `79c812856e72630b.js`, `509a78c63b7911c2.js`, `c7e5d65c0539d707.js`, `03a5fc75fcbaa3ed.js`, `b583e759d7d08eca.js`

Exact byte sizes for these chunks were not captured; run `npm run build` and use the build output or measure file sizes under `.next/static/chunks/` after a fresh build for precise numbers.

---

## 4. Summary table

| Question | Evidence |
|----------|----------|
| What JS loads on first paint (layout route)? | 9 layout chunks (d7401c… through a519c5…), plus framework chunks; home adds e249c7…. |
| What CSS loads on first paint? | a48bf96f2eb4d4fd.css, 3c471c682dcfcf37.css. |
| Is header in its own chunk? | No. Header is inside ConditionalLayout; both share the same client chunk set. |
| Where is framer-motion? | In the layout client dependency chain (ssrModuleMapping); StatusCircles and Button use it; present in the same chunks as the header. |
| Where is next-auth/react? | In the layout client bundle (a519c563f77e93c8.js contains SessionProvider, useSession, signOut, session fetch logic). |
| What is client-only because of the header? | Header itself, StatusCircles (and thus framer-motion), DarkModeToggle (next-themes), LanguageSwitcher, next-auth (useSession/signOut) in the header; all are part of the same layout client bundle, not a separate header-only bundle. |

---

**To get fresh build output (route sizes, shared chunks, warnings):** Run `npm run build` and capture the terminal output; add a “Build output” section to this doc with the relevant excerpts.
