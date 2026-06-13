To match your vision of a **minimalist, ultra-premium interface**, the design system for Academic Agent follows a **"Glassmorphic Tech Shell"** paradigm. By relying on a desaturated neutral palette, smooth rounded corners, and generous negative space, the application mimics a high-end integrated development environment (IDE) that is gentle on the eyes during long engineering study sessions.

---

## 1. Global Visual Identity & Foundations

### Core Typography & Global Styles

* **Font Profile:** `JetBrains Mono` exclusively for headers, navigation, alphanumeric tracking data, and code blocks. This enforces an ordered, technical layout.
* **Border Profiles:** All primary canvas containers use a consistent radius of **`16px` (`rounded-panel`)**. Inner elements like buttons, inputs, and list items use **`8px` (`rounded-element`)**.
* **Transitions:** Stateful interactions (hover, active, focus) employ a micro-interaction animation curve running over `200ms` via Framer Motion or Tailwind transitions (`transition-all duration-200 ease-out`).

### Muted Neutral Palette Tokens

The interface strips away vibrant blues and purples to reduce cognitive load and prevent presentation eye-fatigue.

```
[#EAEAEA Base Canvas] -> [rgba(250,250,250,0.45) Glass Panel] -> [#2E3A47 Primary Text]

```

* **`--bg-base` (`#EAEAEA`):** A soft, cloudy gray canvas background layered with a translucent, un-focused radial gradient mesh to provide depth behind your glass panels.
* **`--glass-bg` (`rgba(250, 250, 250, 0.45)`):** The primary panel background, offering light refraction through a medium-strength backdrop blur (`backdrop-blur: 12px`).
* **`--glass-border` (`rgba(255, 255, 255, 0.6)`):** A crisp, semi-opaque white stroke defining the boundaries of your rounded panels.
* **`--text-main` (`#2E3A47`):** Deep slate gray, replacing harsh pure black to maximize character readability across technical blocks.
* **`--text-muted` (`#5C6B73`):** Medium muted gray for structural tags, dates, and secondary logs.
* **`--accent` (`#7D93A1`):** A desaturated steel-blue tint used selectively to point out active menu states or primary confirmation tags.

---

## 2. Global Layout Architecture

The structural shell employs a **floating dual-panel system**. Instead of layout grids that stretch to the screen edges, components rest like premium software layers over a unified gray environment.

```
+-------------------------------------------------------------------------+
| [Viewport Canvas: #EAEAEA]                                              |
|                                                                         |
|  +---------------------------+   +-----------------------------------+  |
|  | [Sidebar Glass Panel]     |   | [Main Active Canvas Glass Panel]  |  |
|  |                           |   |                                   |  |
|  | - Logo Area (Terminal)    |   | - Context Header Section          |  |
|  |                           |   | - Functional Workspace Grid       |  |
|  | - Navigation Menu Links   |   | - Action/Console Outputs          |  |
|  |                           |   |                                   |  |
|  | - System Core Version Log |   | - Output Viewport Area            |  |
|  |                           |   |                                   |  |
|  +---------------------------+   +-----------------------------------+  |
|                                                                         |
+-------------------------------------------------------------------------+

```

---

## 3. Section-by-Section Style Definitions

### A. Core Structural Sidebar

* **Layout:** A vertical container (`flex flex-col`) pinned to the left edge. Width restricted strictly to `270px`. Bounded on all sides by 1px `--glass-border`.
* **Typography & Colors:** Application branding features a tiny terminal icon (`lucide/terminal`) in `--accent` followed by the plain text `Academic_Agent` in bold.
* **Interactive Elements:** Unselected links use `--text-muted`. Active navigation links transition to `--text-main` and display a very subtle background tint (`rgba(125, 147, 161, 0.15)`) coupled with a sharp 2px vertical border slice on the left-most boundary.

### B. General Application Dashboard

* **Layout:** A non-grid overview frame prioritizing whitespace. It features a split top row (`flex justify-between items-center`) displaying the system greetings and the active session date.
* **Typography & Colors:** Section description blocks use low-opacity `--text-muted` body fonts. Action cards resemble architectural tiles: flat translucent background containers with fine, low-contrast bounding lines.

### C. The PYQ-Driven Study Engine Viewport

* **Layout:** Divided vertically into two strategic halves: an **Ingestion Dropzone** on the left and a **Blueprint Workspace** on the right.
* **Ingestion Dropzone Styles:** A large dotted boundary line box using a dashed border style (`border-dashed border-2 border-white/40`). When files are dragged on top, the backdrop opacity changes smoothly from `0.45` to `0.6`, giving the user clear tactile feedback that the files are being held in place.
* **Blueprint Workspace Styles:** The generated layout parses markdown directly inside nested containers. Headings use prominent sizing increments (`text-lg font-bold`), while individual technical modules render as crisp items inside bulleted lists with ample paragraph spacing (`leading-relaxed tracking-tight`).

### D. Agentic Interrogation Mode Workspace

* **Layout:** Modeled exactly like a minimal command-line console or a sterile coding terminal workspace to eliminate visual distractions.
* **Console Header Styles:** A slim horizontal tab at the top displaying execution metrics: `SESSION_ACTIVE // RESPONSE_SCORE: --%`.
* **Dialogue Interface Styles:** The conversation history stacks top-to-bottom. AI professor queries are marked with a prefix tag (`> PROF_AGENT:`) in `--text-main`. Student response input fields are stripped of boxy borders—built as a single horizontal underline tracking character layout across the screen, ensuring the focus remains squarely on the written code or explanation.

### E. Automated Project Report Architect Viewport

* **Layout:** Structured into a classic dual-column orientation. The left column acts as the parameter configuration slate; the right column acts as a live report rendering view.
* **Configuration Slate Styles:** Input blocks for file paths, variable components, or system specs are styled as flat glass panels with inset typography markers.
* **Live Rendering Window Styles:** Employs an ivory glass canvas (`rgba(255,255,255,0.7)`) nested inside the main view to emulate physical paper texture. Code segments or architecture maps automatically parse into bordered blocks using an offset darker gray context accent to visually pop out from the generated narrative text blocks.