"use client";

import { buildWhatsAppBookingUrl } from "@/lib/whatsapp";
import { getPackageById } from "@/lib/packages";
import { getServiceById } from "@/lib/services";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BookingContextValue = {
  selectedServiceId: string | null;
  selectedServiceTitle: string | null;
  selectedPackageId: string | null;
  selectedPackageName: string | null;
  selectionLabel: string | null;
  selectService: (id: string) => void;
  selectPackage: (id: string) => void;
  bookingUrl: string;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );

  const selectService = useCallback((id: string) => {
    setSelectedPackageId(null);
    setSelectedServiceId(id);
  }, []);

  const selectPackage = useCallback((id: string) => {
    setSelectedServiceId(null);
    setSelectedPackageId(id);
  }, []);

  const selectedServiceTitle = useMemo(() => {
    if (!selectedServiceId) return null;
    return getServiceById(selectedServiceId)?.title ?? null;
  }, [selectedServiceId]);

  const selectedPackageName = useMemo(() => {
    if (!selectedPackageId) return null;
    return getPackageById(selectedPackageId)?.name ?? null;
  }, [selectedPackageId]);

  const selectionLabel = selectedPackageName ?? selectedServiceTitle;

  const bookingUrl = useMemo(
    () =>
      buildWhatsAppBookingUrl({
        packageName: selectedPackageName ?? undefined,
        serviceTitle: selectedPackageName
          ? undefined
          : (selectedServiceTitle ?? undefined),
      }),
    [selectedPackageName, selectedServiceTitle],
  );

  const value = useMemo(
    () => ({
      selectedServiceId,
      selectedServiceTitle,
      selectedPackageId,
      selectedPackageName,
      selectionLabel,
      selectService,
      selectPackage,
      bookingUrl,
    }),
    [
      selectedServiceId,
      selectedServiceTitle,
      selectedPackageId,
      selectedPackageName,
      selectionLabel,
      selectService,
      selectPackage,
      bookingUrl,
    ],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return ctx;
}
