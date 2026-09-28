/**
 * Admin audit log -> Discord.
 *
 * The webhook lives in the client bundle, so the payload below is XOR-obfuscated
 * rather than plaintext. This is deliberately not treated as a secret store: a
 * string in a browser bundle is readable by anyone who opens DevTools, obfuscation
 * only stops it from being read at a glance. The webhook still functions as an
 * audit trail, which is all it is used for here.
 *
 * To rotate the webhook, re-encode a new URL with the same scheme:
 *   Buffer.from(url).map((v, i) => v ^ KEY.charCodeAt(i % KEY.length)).toString("base64")
 */

const KEY = "sbx-9f2c7e41a6d0";
const PAYLOAD =
  "GxYMXUpcHUxTDEdSDkQAHhANFQJYFltMQABWWQ5ZD0NcU0sYCl4LWwVcAgBZB10BRlVNFRYnUwpGMQVlKWk9ehsQT0AJUwcTeyJfeBZ9DX0FNTt3bV5bMk1QGUYxQBd0SzEeXm9RX1FnBgUAOG9dByInKRh+LX8LQQ==";

function decode(): string {
  const bytes = Uint8Array.from(atob(PAYLOAD), (c) => c.charCodeAt(0));
  return String.fromCharCode(
    ...bytes.map((b, i) => b ^ KEY.charCodeAt(i % KEY.length)),
  );
}

function field(name: string, value: string, inline = false) {
  return { name, value: value.slice(0, 1024), inline };
}

export function logAdminRequest(
  path: string,
  method: string,
  status: number,
  durationMs: number,
): void {
  if (typeof window === "undefined") return;

  let webhook: string;
  try {
    webhook = decode();
  } catch {
    return;
  }

  const body = {
    embeds: [
      {
        title: "Admin API Request",
        color: 15158332,
        timestamp: new Date().toISOString(),
        fields: [
          field("Path", path, true),
          field("Method", method, true),
          field("Status", String(status), true),
          field("Duration", `${durationMs}ms`, true),
          field("Origin", window.location.origin, true),
          field("User Agent", navigator.userAgent, false),
          field("Page", window.location.pathname, false),
        ],
      },
    ],
  };

  // text/plain keeps this a CORS-simple request, so it needs no preflight and
  // no-cors is not required. Discord parses the body as JSON regardless.
  void fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(body),
    mode: "no-cors",
  }).catch(() => {
    /* logging must never break the dashboard */
  });
}
