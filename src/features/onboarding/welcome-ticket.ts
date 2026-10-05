/**
 * One-shot ticket for the post-onboarding welcome screen.
 *
 * sessionStorage, not localStorage and not history state: the ticket must
 * survive the FinishStep -> /welcome navigation in the same tab, yet never
 * replay the celebration on a back-navigation, a manual /welcome visit, or a
 * fresh tab. The /welcome route guard consumes it the moment it is honored,
 * so the screen can only be seen once per onboarding completion.
 */
const TICKET_KEY = "travscale:welcome-pending";

export function grantWelcomeTicket(): void {
  try {
    sessionStorage.setItem(TICKET_KEY, "1");
  } catch {
    // Storage unavailable (private mode and friends): the guard will bounce
    // /welcome straight to the dashboard, which is the right destination
    // anyway. Losing the celebration beats blocking the flow.
  }
}

export function consumeWelcomeTicket(): boolean {
  try {
    if (sessionStorage.getItem(TICKET_KEY) !== "1") return false;
    sessionStorage.removeItem(TICKET_KEY);
    return true;
  } catch {
    return false;
  }
}
