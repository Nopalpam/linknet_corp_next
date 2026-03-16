"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("visitor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("visitor_session_id", id);
  }
  return id;
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    // Avoid tracking the same path twice in a row
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const sessionId = getSessionId();
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    fetch(`${API_URL}/public/track-visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname,
        referrer: referrer || null,
        sessionId,
      }),
    }).catch(() => {
      // Silently fail - analytics should never break the user experience
    });
  }, [pathname]);

  return null;
}
