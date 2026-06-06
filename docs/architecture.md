# HomeSHINE Field App — Architecture

## Component Hierarchy (UML)

```
App (Next.js page.tsx)
└── SimpleFieldApp               [Orchestrator — state coordination only]
    ├── ToastHost                [Notification overlay]
    ├── Dialog                   [Confirmation/error modal]
    ├── AppHeader                [Sticky nav, role-based links]
    └── <Screen> (one at a time, keyed for animation)
        ├── LoginScreen          [Auth form]
        ├── PipelineScreen       [Assessment list + filter]
        │   └── DocumentPicker   [Doc preview/share panel]
        ├── OwnerScreen          [New assessment owner form]
        ├── MenuScreen           [Assessment workspace]
        │   ├── CheckoutPanel    [Plan selection + payment]
        │   │   └── DocumentPicker
        │   └── (section tiles → opens SectionScreen)
        └── SectionScreen        [Individual section form]
            └── ConditionButtons [Fair / Good / Great selector]
```

## State Machine — View Transitions

```
                ┌─────────────────────────────────────┐
                │                                     │
                ▼                                     │
[No session] ──login──► [pipeline] ──newAssessment──► [owner]
                │                                     │
                │  ◄──────saveOwner / cancel──────────┘
                │
                ├──openAssessment──► [menu] ──openSection──► [section]
                │                     │                         │
                │                     ◄──────back / saveSection─┘
                │
                ◄──saveAndReturn / back──────────────────────┘
```

## Design Patterns

### 1. Custom Hook Decomposition (Hook Pattern)
State and side-effects are extracted from the UI layer into three focused hooks:

| Hook | Responsibility |
|------|---------------|
| `useSession` | Login, logout, session persistence via `localStorage` |
| `useNotifications` | Toast auto-dismiss, dialog open/close |
| `useAssessments` | Assessment CRUD, navigation state, AI summary |

`SimpleFieldApp` becomes a pure orchestrator — it wires hooks together and renders the active screen. No business logic lives in the component.

### 2. Service Layer (API Module)
All `fetch` calls are isolated in `components/field-app/api.ts`. Components never call `fetch` directly. Benefits:
- Single place to add retry logic, auth headers, or request interceptors
- Testable without React

### 3. Presentational / Container Split
Every `Screen` and `Panel` component is **presentational** — it receives props and calls callbacks. All state transitions happen in `useAssessments` or `SimpleFieldApp`.

```
Container (SimpleFieldApp)         Presentational (e.g. PipelineScreen)
────────────────────────────       ──────────────────────────────────────
Owns state                         Owns no state (except local UI state)
Calls hooks                        Receives data + callback props
Passes props down                  Calls props on user action
```

### 4. Adapter / Normalizer
`normalizeAssessment()` in `api.ts` acts as an adapter between the raw API shape (which may have legacy field names) and the typed `Assessment` domain model. All inbound data passes through it.

### 5. Command Pattern (Checkout)
The checkout flow uses command-style functions — `pickPlan`, `updatePaymentOption`, `updateContractNote` — each of which calls `saveCheckout` with an updated payload. This keeps mutation logic composable without duplicating the save call.

### 6. Observer Pattern (Toast)
`useNotifications` exposes `showToast` and `showDialog` as callbacks. Any hook or component that receives these functions can publish a notification without knowing how it's displayed. The `useEffect` in `useNotifications` auto-dismisses toasts after 5 s.

## Directory Structure

```
components/
  field-app/
    api.ts                  ← API service layer
    types.ts                ← Shared TypeScript types
    utils.ts                ← Pure helpers + CHECKOUT_PLANS constant
    ui.tsx                  ← Primitive UI components (Button, Panel, etc.)
    hooks/
      useAssessments.ts     ← Assessment CRUD + navigation state
      useNotifications.ts   ← Toast + dialog state
      useSession.ts         ← Auth state + localStorage persistence
    screens/
      LoginScreen.tsx
      PipelineScreen.tsx
      OwnerScreen.tsx
      MenuScreen.tsx
      SectionScreen.tsx
    panels/
      CheckoutPanel.tsx
      DocumentPicker.tsx
    shared/
      AppHeader.tsx
      ConditionButtons.tsx
  simple-field-app.tsx      ← Thin orchestrator (~80 lines)
  homeshine-logo.tsx
  promos-carousel.tsx
lib/
  simple-field.ts           ← Domain model + field definitions
  field-app-documents.ts    ← HTML document generators
  supabase-admin.ts         ← DB client
app/
  about/page.tsx            ← Public About page
  certificate/page.tsx
  market/page.tsx
  promos/page.tsx
  reasoning/page.tsx
  api/
    assessments/route.ts
    assessments/[id]/route.ts
    ai-summary/route.ts
```

## Data Flow

```
User action
    │
    ▼
Screen component (calls callback prop)
    │
    ▼
useAssessments function (validates, calls API)
    │
    ├── api.ts (fetch + normalize)
    │       │
    │       └── Supabase / API route
    │
    └── startTransition → setState → re-render
```
