// Client-side helper to trigger Telegram notifications (fire-and-forget)
// Calls /api/telegram/notify — never blocks the UI

export function telegramNotify(type: string, data: Record<string, unknown>): void {
  fetch('/api/telegram/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  }).catch(() => {
    // Silently fail — Telegram notifications are best-effort
  });
}
