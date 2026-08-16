# Propfirm System Calculator

A free, bilingual (EN/ES) prop-firm system calculator by [@TradeDadLog](https://x.com/TradeDadLog).

- **System** how many funded accounts you need to hit your monthly goal
- **Variance** 500-run Monte Carlo of the funded phase (blow-up %, survival, P10/P50/P90)
- **Risk** per-account blow-up probability, daily-DD analysis, portfolio ROI
- **Net P&L** costs and tax to real take-home, effective hourly, break-even
- **Pipeline** live portfolio of accounts (eval, funded, live), editable

## Stack
Vite + React + framer-motion. Single component in `src/App.jsx`. Bilingual (EN/ES, English default). Deployed on Netlify.

## Develop
```
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Static assets (og.png) live in `public/`.
