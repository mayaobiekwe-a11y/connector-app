"use client";

import { useState } from "react";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (e.g. non-HTTPS); the link is
      // already shown as selectable text, so there's nothing else to do.
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-secondary text-sm">
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
