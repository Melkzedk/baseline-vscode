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
