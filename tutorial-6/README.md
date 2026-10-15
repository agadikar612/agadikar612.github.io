# Tutorial 6 — Async/Await and APIs

## Files
- `index.html` — accessible restaurant finder UI
- `style.css` — responsive styling and loading/error states
- `script.js` — async data loading, filters, and array methods
- `restaurants.json` — sample restaurant data loaded with `fetch()`

## Concepts demonstrated
- `async function loadRestaurants()` and `await fetch(...)`
- HTTP response checking and JSON parsing
- `try/catch/finally` error handling and loading states
- Retry and refresh actions
- `forEach()` to populate the cuisine filter
- `filter()` to search/filter the directory
- `map()` to create restaurant cards
- `find()` to locate a featured restaurant
- Responsive layout and accessible status announcements

## Run locally
Because this page uses `fetch()`, run it through a local development server rather than opening `index.html` directly with `file://`. For example, in VS Code install/use Live Server and open this folder with it.

## Deploy to GitHub Pages
Upload the contents of this folder into `tutorial-6/` in your `agadikar612.github.io` repository. Keep the existing root-level files unchanged. The expected URL is:
`https://agadikar612.github.io/tutorial-6/`
