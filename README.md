# aeon Flow

aeon Flow is a small Angular app for tracking tasks.

It started as a project to explore newer Angular features, deliberately using standalone components, signals, and the new control flow syntax.

## Why the name “aeon Flow”?

“aeon” comes from the ancient Greek word **αἰών**, meaning a long span of time or an age rather than a single moment.
“Flow” reflects the idea that time keeps moving — whether we are intentional about it or not.

The goal of aeon Flow isn’t just to list tasks, but to make time feel a little more purposeful and less reactive.

---

## Why this exists

I wanted a compact project that:

- uses current Angular APIs (signals, `@for` / `@if`, standalone setup)
- avoids heavy state libraries while still having clear state management
- stays small enough, but realistic enough to feel “real”
- prioritises UX details (keyboard flow, inline editing, visual hierarchy)

---

## Features

- Create tasks with priority and effort levels
- Inline edit task titles (double-click to edit)
- Mark tasks as completed
- Derived summaries (total, remaining, completed)
- Priority and effort breakdowns
- Keyboard-friendly task entry
- Local persistence (no backend required)

---

## Tech stack & patterns

- Angular (standalone configuration)
- Signals for state and derived state
- Computed signals instead of template logic
- Typed reactive forms
- No NgRx, no global services, no unnecessary abstractions

Core application state lives in a small signal-based store.  
The component remains intentionally thin and focused on UI coordination.

---

## Persistence

Tasks are stored using browser `localStorage`.

- Refreshing the page on the same device does not lose data
- Data is scoped per browser and per device
- There is no cross-device sync

---

## Limitations

Because persistence is handled via `localStorage`:

- Clearing browser data will remove tasks
- Private / incognito mode may discard data on exit
- Data is not shared across devices or browsers

These trade-offs are intentional for the scope of this project.

---

## Future work

This is a limited starter project. Possible next steps include:

- Replace `localStorage` with IndexedDB for more robust client-side storage
- Add an optional backend using **Supabase** to support:
  - permanent persistence
  - cross-device sync
  - user accounts
- Introduce routing for multiple views (Today / All / Completed)


These are intentionally out of scope for now, but the current structure could easily support these steps.


## Running the project locally

```bash
npm install
ng serve

## Live demo

https://mazzyk.github.io/aeon-flow/


## Author

Mary Koutsikou  
Full-stack developer

## License

MIT
