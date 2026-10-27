import { getConcern } from '../../data/concerns';
import { CRISIS_CONTACTS } from '../../data/crisis';
import { ORG } from '../../data/organisation';
import type { PersonaState } from '../../domain/persona/machine';

/**
 * A plain-text summary the person can save to their own device. It is created
 * in the browser; nothing is uploaded. What they typed is included only if
 * they choose.
 */
export function buildSummary(state: PersonaState, includeWords: boolean): string {
  const lines: string[] = [];
  lines.push('Imela — your summary');
  lines.push(new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }));
  lines.push('');

  const areas = state.selectedConcerns.map((s) => getConcern(s)?.title).filter(Boolean);
  if (areas.length) {
    lines.push('Areas you explored:');
    areas.forEach((a) => lines.push(`  - ${a}`));
    lines.push('');
  }

  if (state.result) {
    lines.push('Options that might help:');
    for (const r of state.result.recommendations) {
      lines.push(`  - ${r.service.name}`);
      lines.push(`    ${r.reason}`);
    }
    lines.push('');
  }

  if (includeWords && state.statements.length) {
    lines.push('What you wrote:');
    state.statements.forEach((s) => lines.push(`  "${s}"`));
    lines.push('');
  }

  lines.push('This summary is a starting point, not a diagnosis or clinical assessment.');
  lines.push(`Book or ask a question: ${ORG.phoneDisplay} · ${ORG.email}`);
  lines.push('If you are in danger: ' + CRISIS_CONTACTS.map((c) => `${c.label} ${c.display}`).join(' · '));
  return lines.join('\n');
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
