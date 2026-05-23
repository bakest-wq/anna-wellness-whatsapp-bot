"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE_LOGO_ALT, SITE_LOGO_PATH, SITE_TITLE } from "@/lib/brand";
import { cn } from "@/lib/cn";

/** Intrinsic size for layout; display size controlled via CSS (aspect ratio preserved). */
const LOGO_WIDTH = 320;
const LOGO_HEIGHT = 96;

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  withDarkFrame?: boolean;
};

export function SiteLogo({
  className,
  imageClassName,
  priority = false,
  withDarkFrame = true,
}: SiteLogoProps) {
  const [failed, setFailed] = useState(false);

  const image = failed ? (
    <span className="font-display text-[1.05rem] font-medium tracking-tight text-[#FFF9F3] sm:text-lg">
      {SITE_TITLE}
    </span>
  ) : (
    <Image
      src={SITE_LOGO_PATH}
      alt={SITE_LOGO_ALT}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      sizes="(max-width: 640px) 168px, 220px"
      quality={90}
      onError={() => setFailed(true)}
      className={cn(
        "block h-8 w-auto max-w-[min(10.5rem,44vw)] object-contain object-left sm:h-9 sm:max-w-[11rem]",
        imageClassName,
      )}
    />
  );

  if (!withDarkFrame) {
    return <span className={cn("inline-flex items-center", className)}>{image}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-h-[2.5rem] items-center rounded-lg bg-[#2C2620] px-2.5 py-1.5 shadow-[0_6px_20px_-8px_rgba(44,38,32,0.45)] ring-1 ring-[#C4A574]/12",
        className,
      )}
    >
      {image}
    </span>
  );
}
