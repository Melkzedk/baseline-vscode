# baseline-vscode

A small Visual Studio Code extension that highlights web-platform features found in your files against a sample "Baseline" (a JSON list of features). It produces diagnostics (warnings/info), provides hover details (notes, browser support, MDN links), and exposes a manual command to re-scan the active document.

## Key ideas
- Inputs: source text in supported languages (JS/TS/HTML/CSS and variants).
- Outputs: VS Code diagnostics and hover information pointing to whether a feature is marked `safe` in the sample baseline and a short note + browser support.
- Error modes: unsupported languages are ignored (diagnostics are cleared).

## Features
- Diagnostics: warnings for features not marked safe in the sample baseline; informational diagnostics for features marked safe.
- Hover details: name, safe/not-safe note, per-browser first-supported versions, and an MDN link when available.
- Manual command: `baseline.checkDocument` (Command Palette: "Baseline: Check Document") to re-scan the active editor.

## Supported languages
The extension checks documents with these language IDs (from `sr/extension.ts`):

- `javascript`
- `javascriptreact`
- `typescript`
- `typescriptreact`
- `css`
- `scss`
- `less`
- `html`

## Where the baseline comes from
The sample baseline is stored at `sr/baseline.json`. It's a simple JSON document with a top-level `features` array. Each feature contains keys such as `id`, `type`, `name`, `safe`, `note`, `browsers`, and `mdn`.

Example feature (from the sample baseline):

```json
{
  "id": "fetch",
  "type": "api",
  "name": "fetch",
  "safe": true,
  "note": "Widely supported fetch API.",
  "browsers": { "chrome": "42", "firefox": "39", "safari": "10.1" },
  "mdn": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"
}
```

The feature matching is implemented in `sr/featureScanner.ts`. The current implementation uses simple regex-based matching (see the file header note) — this is fast but can cause false positives; consider swapping to AST-based parsing for improved accuracy.

## Development / Build

Prerequisites
- Node.js and npm
- Visual Studio Code (for extension development host)

Quick start (PowerShell)

```powershell
# install dependencies
npm install

# compile TypeScript to JavaScript
npx tsc -p .

# open the project in VS Code and press F5 to run the Extension Development Host
code .
```

Notes
- The project uses TypeScript devDependencies located in `package.json`. The compiled output must be present for VS Code to load the extension when running from the Extension Development Host.

## Usage

1. Open a supported file (JS/TS/CSS/HTML).
2. The extension automatically scans open documents and updates diagnostics.
3. Hover over a token that matches a baseline feature to see details (safe status, note, browser support, MDN link).
4. Run the command "Baseline: Check Document" from the Command Palette to manually trigger a scan.

## Contributing
- Add or edit features in `sr/baseline.json` to tune the sample Baseline.
- Improve matching precision in `sr/featureScanner.ts` (AST-based matching recommended for JS/TS APIs).
- Add tests and CI as needed; the repository currently has no test harness.

## Limitations & Edge cases
- Matching is regex-based and can produce false positives (e.g., identifiers in comments or unrelated contexts). Use an AST-aware approach if you need exactness.
- The sample baseline is intentionally small; real projects may require a richer baseline and configuration.

## Files of interest
- `sr/extension.ts` — activation logic, diagnostics, hover provider, and command registration.
- `sr/featureScanner.ts` — baseline loader and matching implementation.
- `sr/baseline.json` — sample Baseline data used by the extension.
- `package.json` — project metadata and dev dependencies.

## License
This project uses the `ISC` license as specified in `package.json`.

---

If you'd like, I can also:
- Add a short contributing guide or template for baseline entries.
- Add a `build` script to `package.json` (e.g., `"build": "tsc -p ."`).

Contact the maintainers or open an issue/pr to propose changes.

## About the project

This small extension grew from a simple idea: make it obvious, as you edit, when web-platform features in your code are considered part of a stable "Baseline" for your audience. I was inspired by the frequent need to balance progressive enhancement with broad compatibility — teams often debate whether a new API or CSS feature is safe to ship. I wanted a tiny, local tool that makes those decisions more visible while you code.

What I learned
- Working end-to-end with the VS Code extension API is approachable: registering diagnostics, hover providers, and commands lets a lightweight tool integrate tightly with the editor.
- TypeScript + simple JSON-based configuration (the baseline) is a productive pairing for small developer tools.
- Heuristics (regex matching) are easy to implement but quickly show their limits; accurate language-aware analysis usually needs AST parsing.

How I built it
- Started with a minimal baseline JSON (`sr/baseline.json`) and a tiny scanner (`sr/featureScanner.ts`) that loads the baseline and searches text for matches using regexes.
- Connected the scanner to the VS Code extension lifecycle in `sr/extension.ts`: on activation the extension scans open documents, updates diagnostics, registers a hover provider to show notes and browser support, and adds a command to re-scan the active document.
- Kept dependencies intentionally minimal (TypeScript only) so the project is straightforward to build and iterate on.

Challenges faced
- Matching accuracy: using regex-based matches produced false positives (matches in comments, or unrelated identifiers). I deferred an AST-based implementation to keep the initial scope small, but that's the natural next step for the project.
- UX choices: deciding whether to surface unsafe features as warnings (which can feel noisy) or as informational hints required balancing strictness vs. developer annoyance. The current approach uses warnings for features not marked safe and info for safe features.
- Packaging for others: publishing a VS Code extension requires additional metadata and packaging steps; for now the repo focuses on local development and iteration.

If you'd like, I can expand this narrative into a short CONTRIBUTING guide describing how to add baseline entries, or implement the AST-based matcher as a follow-up.
