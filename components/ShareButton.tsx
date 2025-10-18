"use client";

import { useState } from "react";

type ShareButtonProps = {
  url?: string;        // optional override (defaults to window.location.href)
  title?: string;      // optional share title (defaults to document.title)
  className?: string;  // optional styling
};

export default function ShareButton({ url, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const shareUrl = url ?? window.location.href;
    const shareTitle = title ?? document.title;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback best effort: copy URL
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // no-op
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Share this closet"
      className={
        className ??
        "rounded-full border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
      }
    >
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
