import { formatRecoverySecret } from '../../../supabase/functions/_shared/personaCredentials';

export function credentialsText(personaCode: string, recoverySecret: string) {
  return [
    'Imela — keep this private',
    '',
    `Persona ID:       ${personaCode}`,
    `Recovery secret:  ${formatRecoverySecret(recoverySecret)}`,
    '',
    'You need both to return to your counselling space at /persona/access.',
    'Imela cannot recover a lost secret. Store this somewhere only you can reach.',
  ].join('\n');
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function createCaseErrorMessage(reason: string, message?: string) {
  if (reason === 'limit') return message ?? 'You have reached the limit for new conversations. Please continue in an existing one.';
  if (reason === 'network') return "We couldn't reach Imela. Please check your connection and try again — nothing has been sent.";
  if (reason === 'invalid') return 'Please choose at least one support area, and keep your message within the limit.';
  return 'Something went wrong and your conversation was not sent. Please try again.';
}
