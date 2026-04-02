import { toast } from "sonner";

type AlertKind = "success" | "error" | "default";

const SUCCESS_PATTERNS = [
  /success/i,
  /complete/i,
  /created/i,
  /converted/i,
  /download started/i,
  /downloaded/i,
  /extracted/i,
  /generated/i,
  /saved/i,
  /copied/i,
  /ready/i,
  /enabled/i,
];

const ERROR_PATTERNS = [
  /fail/i,
  /error/i,
  /invalid/i,
  /please /i,
  /unsupported/i,
  /not found/i,
  /cannot/i,
  /unable/i,
  /missing/i,
  /try again/i,
  /not available/i,
];

function classifyAlert(message: string): AlertKind {
  if (ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return "error";
  }

  if (SUCCESS_PATTERNS.some((pattern) => pattern.test(message))) {
    return "success";
  }

  return "default";
}

export function showSmartAlert(message: string) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return;
  }

  switch (classifyAlert(trimmedMessage)) {
    case "success":
      toast.success(trimmedMessage);
      return;
    case "error":
      toast.error(trimmedMessage);
      return;
    default:
      toast(trimmedMessage);
  }
}

export function installSweetAlertBridge() {
  if (typeof window === "undefined") {
    return;
  }

  const globalWindow = window as Window & {
    __sweetAlertsInstalled?: boolean;
    __nativeAlert?: typeof window.alert;
  };

  if (globalWindow.__sweetAlertsInstalled) {
    return;
  }

  globalWindow.__sweetAlertsInstalled = true;
  globalWindow.__nativeAlert = window.alert.bind(window);

  window.alert = ((message?: unknown) => {
    showSmartAlert(String(message ?? ""));
  }) as typeof window.alert;
}
