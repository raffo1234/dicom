"use client";

import React, { useEffect, useRef } from "react";

export default function InfiniteScrollSentinel({
  onElementVisible,
  loading,
}: {
  onElementVisible: () => void;
  loading: boolean;
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onElementVisible();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
      observer.disconnect();
    };
  }, [onElementVisible, loading]);

  return <div ref={sentinelRef} className="relative -translate-y-20"></div>;
}
