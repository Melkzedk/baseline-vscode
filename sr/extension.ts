// src/extension.ts
import * as vscode from 'vscode';
import { findFeatureMatches, loadBaseline } from './featureScanner';

const SUPPORTED_LANGUAGES = [
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
  'css',
  'scss',
  'less',
  'html'
];

export function activate(context: vscode.ExtensionContext) {
  const baseline = loadBaseline();
  const diagnostics = vscode.languages.createDiagnosticCollection('baseline-check');
  context.subscriptions.push(diagnostics);

  // Analyze a single document and set diagnostics
  function analyzeDocument(doc: vscode.TextDocument) {
    if (!SUPPORTED_LANGUAGES.includes(doc.languageId)) {
      // Clear diagnostics for unsupported languages
      diagnostics.delete(doc.uri);
      return;
    }

    const text = doc.getText();
    const matches = findFeatureMatches(text, baseline);

    const diags: vscode.Diagnostic[] = [];

    for (const m of matches) {
      const start = doc.positionAt(m.index);
      const end = doc.positionAt(m.index + m.length);
      const range = new vscode.Range(start, end);

      const feature = m.feature;
      const message = feature.safe
        ? `${feature.name} — marked safe in sample Baseline.`
        : `${feature.name} — NOT in sample Baseline: ${feature.note || 'No note provided.'}`;

      // Use Warning for features not in Baseline, Info for safe features
      const severity = feature.safe ? vscode.DiagnosticSeverity.Information : vscode.DiagnosticSeverity.Warning;

      const diag = new vscode.Diagnostic(range, message, severity);
      diag.source = 'baseline';
      diags.push(diag);
    }

    diagnostics.set(doc.uri, diags);
  }

  // Initial scan of open documents
  if (vscode.window.activeTextEditor) {
    analyzeDocument(vscode.window.activeTextEditor.document);
  }

  // React to file open / change / save / close
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(analyzeDocument),
    vscode.workspace.onDidChangeTextDocument((e) => analyzeDocument(e.document)),
    vscode.workspace.onDidSaveTextDocument(analyzeDocument),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri))
  );

  // Hover provider: show Baseline info when hovering over a matched token
  const hoverProvider = vscode.languages.registerHoverProvider(SUPPORTED_LANGUAGES, {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
      const text = document.getText();
      const matches = findFeatureMatches(text, baseline);
      const offset = document.offsetAt(position);

      for (const m of matches) {
        if (m.index <= offset && offset <= m.index + m.length) {
          const f = m.feature;

          const md = new vscode.MarkdownString();
          md.appendMarkdown(`**${f.name}**\n\n`);
          if (f.safe) {
            md.appendMarkdown(`✅ _Marked safe in sample Baseline._\n\n`);
          } else {
            md.appendMarkdown(`⚠️ **Not in sample Baseline** — ${f.note || ''}\n\n`);
          }
          md.appendMarkdown(`**Browser support (first supported versions)**:\n`);
          for (const b of Object.keys(f.browsers || {})) {
            md.appendMarkdown(`- **${b}**: ${f.browsers[b]}\n`);
          }
          if (f.mdn) {
            md.appendMarkdown(`\n[MDN](${f.mdn})`);
            md.isTrusted = true;
          }

          return new vscode.Hover(md);
        }
      }
      return undefined;
    }
  });

  context.subscriptions.push(hoverProvider);

  // Manual command to trigger an immediate scan of the active editor
  const checkCmd = vscode.commands.registerCommand('baseline.checkDocument', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      void vscode.window.showInformationMessage('Open a supported document (JS/TS/CSS/HTML) to check Baseline features.');
      return;
    }
    analyzeDocument(editor.document);
    void vscode.window.showInformationMessage('Baseline: scanned current document.');
  });
  context.subscriptions.push(checkCmd);
}

export function deactivate() {
  // Nothing to do
}
