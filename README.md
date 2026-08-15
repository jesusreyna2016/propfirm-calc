# Propfirm System Calculator

A free, bilingual (EN/ES) prop-firm system calculator by [@TradeDadLog](https://x.com/TradeDadLog).

- **System** — how many funded accounts you need to hit your monthly goal
- **Variance** — 500-run Monte Carlo of the funded phase (blow-up %, survival, P10/P50/P90)
- **Risk** — per-account blow-up probability, daily-DD analysis, portfolio ROI
- **Net P&L** — costs + tax → real take-home, effective hourly, break-even
- **Pipeline** — live portfolio of accounts (eval → funded → live), editable

## Build
Source is a single React component (`propfirm-system-calc_1.jsx`). It is pre-transpiled with Babel
(`@babel/preset-react`) to `app.js`, which runs against React 18 loaded from a CDN — **no build step
on deploy**. `index.html` mounts `<App/>` into `#root`.

To regenerate `app.js` after editing the source: transpile the JSX (strip the `react` import, drop
`export default`, keep classic runtime) and append the `ReactDOM.createRoot(...).render(...)` mount.
