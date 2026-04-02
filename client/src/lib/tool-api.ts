import { downloadBlob } from "./download";

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  let message = `Request failed with status ${response.status}.`;

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
      };
      message = payload.error || payload.message || message;
      return message;
    }

    const text = await response.text();
    if (text.trim()) {
      message = text.trim();
    }
  } catch {
    // Fall through to the default message.
  }

  return message;
}

export async function fetchToolBlob(endpoint: string, formData: FormData) {
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.blob();
}

export async function downloadToolBlob(
  endpoint: string,
  formData: FormData,
  filename: string
) {
  const blob = await fetchToolBlob(endpoint, formData);
  downloadBlob(blob, filename);
  return blob;
}

export async function fetchToolJson<T>(endpoint: string, formData: FormData) {
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

