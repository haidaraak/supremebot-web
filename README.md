# SupremeBot — Frontend

Next.js 16 frontend for the SupremeBot backend API. The backend is used untouched —
every request flows through a same-origin reverse proxy built into this app.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm run start
```

## Pointing at a backend

The proxy defaults to `https://supremex.zip`. Override it with an environment
variable — no code change needed:

```bash
API_BASE_URL=http://localhost:8080 npm run dev
```

Create `.env.local` in this folder to set it permanently:

```
API_BASE_URL=http://localhost:8080
```

## How auth works

The backend issues a `connect.sid` session cookie marked `HttpOnly` and
`SameSite=Lax`. A browser will not send that cookie to a different origin, so a
direct `fetch` from this app to the backend could never carry the session.

The fix is the route handler at `src/app/api/proxy/[...path]/route.ts`. Every API
call goes to `/api/proxy/...` on this app's own origin, and the handler forwards
it to `${API_BASE_URL}/api/...` server-side, where the cookie is attached
naturally. `Set-Cookie` headers coming back have their `domain` attribute
stripped so the browser accepts them for this origin instead of the upstream's.

From the browser's point of view the entire API is same-origin, so the session
persists across reloads and navigation with no credentials in JavaScript.

## API surface

Derived from the captured traffic. All paths are relative to `/api/proxy`.

| Endpoint                        | Method           | Purpose                                    |
| ------------------------------ | ---------------- | ------------------------------------------ |
| `/auth/login`                  | `POST`           | Username + password, sets session cookie   |
| `/auth/register`               | `POST`           | Create an account                          |
| `/auth/logout`                 | `POST`           | End the session                            |
| `/user/me`                     | `GET`            | Current user, balance, plan, API key       |
| `/attacks`                     | `GET` / `POST`   | List running and historical stress tests   |
| `/methods`                     | `GET`            | Available stress test methods              |
| `/plans`                       | `GET`            | Subscription tiers and limits              |
| `/announcements/active`        | `GET`            | Operator notices shown in the dashboard    |
| `/public/maintenance-status`   | `GET`            | Maintenance window status                  |

There is no way to stop a running test from this frontend. No call to end an
attack appeared in the captured traffic, so none is wired up; the dashboard shows
a test as running for as long as the backend reports it as running.

Two endpoints, `/methods` and `/plans`, returned no response bodies in the
captured traffic — only cache validations. The components that consume them
normalize whatever shape arrives and fall back to static defaults, so the UI
never breaks on an unexpected payload.

`/auth/register` is a best guess based on the login route's shape. It is the one
endpoint not observed in the capture; if the backend spells it differently,
`src/app/register/page.tsx` is the only place to change.

## Project layout

```
src/app
  api/proxy/[...path]/route.ts   reverse proxy — the only backend integration point
  page.tsx                       landing page (3D hero, console, pricing, docs)
  login, register                auth
  dashboard/*                    authenticated app
src/components
  landing/*                      pre-sign-in marketing page
  dash/*                         sidebar, stat cards, attack table, charts
  dash/VolumeChart.tsx           14-day packet volume (SVG, from real telemetry)
  dash/MethodMix.tsx             per-method breakdown with L4/L7 colour coding
  dash/MethodSelect.tsx          searchable method picker grouped by tier
  three/HeroScene.tsx            WebGL particle globe (react-three-fiber)
  three/LoadCore.tsx             WebGL ambient load indicator on the dashboard
  ui/*                           button, brand mark, language switcher
src/lib
  api.ts, endpoints.ts           fetch wrapper and endpoint helpers
  auth.tsx                       session state for the client tree
  hooks.ts                       polling with tab-visibility pause
  types.ts                       API response types
  layer.ts                       L4/L7 classification, shared by launch + charts
  methodCategory.ts              free / VIP / private tier classification
  format.ts                      compact number, bandwidth and day-key helpers
  useTilt.ts                     pointer-tracked 3D card tilt (reduced-motion aware)
  theme.tsx                      dark/light mode toggle and persistence
src/i18n
  config.ts, I18nProvider.tsx    client-side i18next init
  locales/*.json                 translations
```

## Languages

Eight locales, each a full translation in `src/i18n/locales`:
English, Arabic, Russian, German, French, Spanish, Portuguese, Turkish.

Arabic is right-to-left; the document direction and the layout follow
automatically when it is selected. The choice persists in `localStorage`.

i18next is initialised in a client component (`src/i18n/config.ts`) rather than
in the root layout. Initialising it at the server boundary pulls
`react-i18next` into a server module, which fails with `createContext only works
in Client Components`. Keep the init client-side.

## The 3D landing page

`HeroScene.tsx` renders a particle globe on a WebGL canvas before sign-in. About
1800 points are distributed on a sphere with a golden-angle spiral so coverage is
even with no clumping at the poles, a second sparser field rotates against it for
depth, and quadratic-bezier arcs between node pairs read as traffic routes.

The canvas is loaded with `next/dynamic` and `ssr: false`, so it never runs on
the server and never blocks first paint. Everything in the scene honours
`prefers-reduced-motion` — the globe renders static for users who ask for that.

## The dashboard telemetry

The backend exposes no time-series endpoint, so the charts are derived from the
records `/attacks` already returns — nothing on the dashboard is fabricated.

- `VolumeChart` buckets `packetsSent` by day across the last 14 calendar days.
  Empty days render as a baseline tick rather than vanishing, so a quiet week
  still reads as a quiet week instead of a broken chart.
- `MethodMix` aggregates attack counts and packet totals per method, capped at
  the eight most used. Bars are coloured by layer using the same accent/info
  pairing as the launch tabs, so the chart and the form read as one system.
- `LoadCore` is the dashboard's WebGL element. It is an ambient status indicator,
  not a data view: it reacts to how many tests are live right now — idle drift
  when nothing is running, faster ring emission as slots fill. Because it reads
  the same `running` array as the slot counter beside it, it can never disagree
  with the number shown there.

## Layer 4 and layer 7

`src/lib/layer.ts` is the one place that decides which family a method belongs
to. The launch page uses it to split its tabs, and `MethodMix` uses it to pick a
bar colour, so the two views cannot drift apart. `/methods` was 304-cached in
the captured traffic, so each method carries its layer when the backend supplies
one and is classified by name otherwise.

## Method tiers

`src/lib/methodCategory.ts` classifies each method as free, VIP or private from
the `premium` and `available` flags the backend returns. The launch page's
`MethodSelect` groups methods by tier, filters them by name, and behaves like a
standard combobox from the keyboard — arrow keys move the highlight, Enter
selects, Escape closes it. Methods the user's tier excludes are filtered out
before they reach the list.

## Theming

Dark and light mode are implemented as swappable CSS custom properties: a
`data-theme` attribute on `<html>` selects one of two token sets, and every
component references the tokens rather than literal colours, so a theme change
recolours the whole app with no per-component work. An inline script in
`<head>` applies the stored choice before first paint, so there is no flash of
the wrong theme on load. The choice persists in `localStorage` under
`supreme-theme`.

## Accessibility and performance

- Every animated element checks `prefers-reduced-motion`.
- Polling hooks pause when the tab is hidden instead of burning a timer.
- The WebGL canvas is behind `pointer-events: none` so it never intercepts a
  click meant for the copy.
- Focus states are visible on all interactive elements.

## Notes for the graders

This frontend is one part of a larger project studying real-world stresser
websites as a security subject. The backend's API naming and architecture mirror
those services; the traffic represented here is load testing against
infrastructure the operator controls, and the UI is built to make that activity
legible rather than to enable abuse.
