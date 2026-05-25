"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useBooking } from "@/components/landing/booking-context";

export function FloatingMobileDock() {
  const { bookingUrl } = useBooking();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById("booking");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setHidden(e.isIntersecting && e.intersectionRatio > 0.15),
      { threshold: [0, 0.15] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="bs-dock" role="group" aria-label="Запись">
      <a href="#booking" className="bs-dock__primary">
        Записаться
      </a>
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bs-dock__wa"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
      </a>
    </div>
  );
}
