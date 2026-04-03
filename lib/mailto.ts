/**
 * mailto: URLs hit hard limits in browsers and OS handlers (~2k–8k chars).
 * Long bodies must not be embedded; copy to clipboard and open with a short paste hint.
 */

/** Conservative limit — many clients fail above ~2k; encoded UTF-8 expands further. */
const MAX_MAILTO_URL_LENGTH = 1200;

const PASTE_HINT_BODY =
  "The full removal request was copied to your clipboard.\n\nPaste it into the message body (Ctrl+V or Cmd+V).\n\n— Sniffer";

export function buildMailtoHref(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Opens the default mail client. Copies the full body to the clipboard when the mailto URL would be too long.
 */
export async function openMailtoDraft(params: {
  to: string;
  subject: string;
  body: string;
  /** When the mailto URL is too long, this is copied instead of `body` (e.g. full draft including Subject line). */
  clipboardTextWhenTooLong?: string;
}): Promise<void> {
  const { to, subject, body, clipboardTextWhenTooLong } = params;
  const fullHref = buildMailtoHref(to, subject, body);

  if (fullHref.length <= MAX_MAILTO_URL_LENGTH) {
    window.location.assign(fullHref);
    return;
  }

  const toCopy = clipboardTextWhenTooLong ?? body;
  try {
    await navigator.clipboard.writeText(toCopy);
  } catch {
    /* Clipboard may be denied; user can copy from the page */
  }

  const hintHref = buildMailtoHref(to, subject, PASTE_HINT_BODY);
  if (hintHref.length <= MAX_MAILTO_URL_LENGTH) {
    window.location.assign(hintHref);
    return;
  }

  window.location.assign(`mailto:${to}`);
}

/** Parses "Subject: …\\n\\nbody" drafts so mailto subject and body are not duplicated. */
export function splitSubjectLineDraft(fullText: string, fallbackSubject: string): { subject: string; body: string } {
  const trimmed = fullText.replace(/\r\n/g, "\n").trimStart();
  if (!/^subject:/i.test(trimmed)) {
    return { subject: fallbackSubject, body: fullText.trim() };
  }
  const firstNl = trimmed.indexOf("\n");
  if (firstNl === -1) {
    return { subject: fallbackSubject, body: fullText.trim() };
  }
  const subject = trimmed.slice(0, firstNl).replace(/^subject:\s*/i, "").trim();
  const body = trimmed.slice(firstNl + 1).replace(/^\s*\n+/, "").trim();
  return { subject: subject || fallbackSubject, body };
}
