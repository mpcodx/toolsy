export type CookieConsentStatus = "accepted" | "rejected";

export const COOKIE_CONSENT_COOKIE = "toolsy_cookie_consent";
export const VISIT_COUNT_COOKIE = "toolsy_visit_count";
export const FIRST_SEEN_COOKIE = "toolsy_first_seen";
export const LAST_SEEN_COOKIE = "toolsy_last_seen";

export const COOKIE_CONSENT_CHANGED_EVENT = "toolsy:cookie-consent-changed";
export const OPEN_COOKIE_SETTINGS_EVENT = "toolsy:open-cookie-settings";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function isBrowser() {
  return typeof document !== "undefined" && typeof window !== "undefined";
}

function isSecureContext() {
  return isBrowser() && window.location.protocol === "https:";
}

export function getCookie(name: string) {
  if (!isBrowser()) {
    return null;
  }

  const encodedName = encodeURIComponent(name);
  const pair = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${encodedName}=`));

  if (!pair) {
    return null;
  }

  return decodeURIComponent(pair.slice(encodedName.length + 1));
}

export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number = ONE_YEAR_SECONDS
) {
  if (!isBrowser()) {
    return;
  }

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAgeSeconds}`,
    "samesite=lax",
  ];

  if (isSecureContext()) {
    parts.push("secure");
  }

  document.cookie = parts.join("; ");
}

export function deleteCookie(name: string) {
  setCookie(name, "", 0);
}

export function readCookieConsent(): CookieConsentStatus | null {
  const consent = getCookie(COOKIE_CONSENT_COOKIE);

  if (consent === "accepted" || consent === "rejected") {
    return consent;
  }

  return null;
}

export function saveCookieConsent(status: CookieConsentStatus) {
  setCookie(COOKIE_CONSENT_COOKIE, status);

  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: status }));
  }

  return status;
}

export function clearVisitorCookies() {
  deleteCookie(VISIT_COUNT_COOKIE);
  deleteCookie(FIRST_SEEN_COOKIE);
  deleteCookie(LAST_SEEN_COOKIE);
}

export function recordVisitorCookies() {
  if (readCookieConsent() !== "accepted") {
    return null;
  }

  const now = new Date().toISOString();
  const firstSeen = getCookie(FIRST_SEEN_COOKIE) || now;
  const previousCount = Number.parseInt(getCookie(VISIT_COUNT_COOKIE) || "0", 10);
  const visitCount = Number.isFinite(previousCount) && previousCount > 0 ? previousCount + 1 : 1;

  setCookie(FIRST_SEEN_COOKIE, firstSeen);
  setCookie(LAST_SEEN_COOKIE, now);
  setCookie(VISIT_COUNT_COOKIE, String(visitCount));

  return {
    firstSeen,
    lastSeen: now,
    visitCount,
  };
}
