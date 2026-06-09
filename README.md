# Notus Regalia

**Notus Regalia** is an official company website built as a modern, performance-first frontend using Next.js and TypeScript. It showcases our core sectors — Defense, Healthcare, Civic, and Parent Company — through a polished, animated experience designed for demos, client presentations, and public-facing communications.

---

## Overview

The site is organized around four sector-focused feature groups, each with dedicated landing, information, company, and technologies pages. A shared component library keeps the UI consistent across all pages, and smooth animations and 3D elements give the experience a distinctive, premium feel.

---

## Tech Stack

| Category      | Technology                                 |
| ------------- | ------------------------------------------ |
| Framework     | Next.js 15 (App Router)                    |
| Language      | TypeScript 5.x                             |
| UI Library    | React 19.x                                 |
| Styling       | Tailwind CSS 3.x, PostCSS, Autoprefixer    |
| Animations    | Framer Motion, GSAP                        |
| 3D / WebGL    | Spline (`@splinetool/react-spline`), `ogl` |
| Visualization | D3, GlobeD3                                |
| Scroll        | Lenis                                      |
| Utilities     | `clsx`, `tailwind-merge`                   |
| Linting       | ESLint, TypeScript ESLint                  |
| Deployment    | Vercel                                     |

See [`package.json`](package.json) for exact dependency versions.

---

## Getting Started

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site locally.

### Other scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── contact/
│   ├── defense/
│   └── ...
├── components/             # Feature and UI components
│   ├── DefenseSector/
│   ├── HealthcareSector/
│   ├── CivicSector/
│   ├── ParentCompany/
│   └── ui/                 # Shared UI library (nav, footer, modals, loaders)
├── styles/                 # Global and component CSS modules
├── hooks/                  # Custom React hooks
└── utils/                  # Helper utilities
```

---

## Sectors

The site is organized around four primary sectors, each containing **Landing**, **Information**, **Company**, and **Technologies** pages:

- **Defense** — capabilities and technologies for defense applications
- **Healthcare** — solutions and innovations in the healthcare space
- **Civic** — public sector and civic engagement offerings
- **Parent Company** — corporate overview, leadership, and company-wide information

---

## Contributing

1. Fork the repo and create a feature branch
2. Follow the existing code style — TypeScript, Tailwind utility classes, and ESLint rules
3. If adding a new component, include a brief usage example in `src/components/`
4. Open a pull request with a clear description of your changes

For bugs or questions, open an issue in this repository or reach out through the [contact page](https://yourwebsite.com/contact).

---

## License

ISC — see [`package.json`](package.json) for details.
