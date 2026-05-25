"use client";

import { useEffect, useState } from "react";

/** True after client mount — safe gate for scroll/DOM-dependent motion. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
