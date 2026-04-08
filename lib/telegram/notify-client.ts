// Client-side helper to trigger Telegram notifications (fire-and-forget)
// Calls /api/telegram/notify with Firebase auth token — never blocks the UI

export function telegramNotify(type: string, data: Record<string, unknown>): void {
  const sendNotification = async () => {
    const { auth } = await import('@/firebase/config');
    const token = await auth.currentUser?.getIdToken();
    if (!token) return; // Not authenticated, skip

    await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ type, data }),
    });
  };

  sendNotification().catch(() => {
    // Silently fail — Telegram notifications are best-effort
  });
}
