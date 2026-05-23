"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type ClientNotesFieldProps = {
  phoneKey: string;
  initialNotes: string;
  initialUpdatedAt: string | null;
  onSaved: (notes: string, updatedAt: string) => void;
};

export function ClientNotesField({
  phoneKey,
  initialNotes,
  initialUpdatedAt,
  onSaved,
}: ClientNotesFieldProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(initialUpdatedAt);

  useEffect(() => {
    setNotes(initialNotes);
    setSavedAt(initialUpdatedAt);
  }, [phoneKey, initialNotes, initialUpdatedAt]);

  const isDirty = notes !== initialNotes;

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/clients/${encodeURIComponent(phoneKey)}/notes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        },
      );

      const result = (await response.json().catch(() => null)) as {
        notes?: string;
        updatedAt?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Не удалось сохранить заметку.");
      }

      const savedNotes = result?.notes ?? notes;
      const updatedAt = result?.updatedAt ?? new Date().toISOString();
      setNotes(savedNotes);
      setSavedAt(updatedAt);
      onSaved(savedNotes, updatedAt);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить заметку.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-client-notes">
      <label className="block">
        <span className="text-soft text-[11px] font-semibold uppercase tracking-[0.18em]">
          Заметки о клиенте
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Предпочтения, особенности, важные детали для следующего визита…"
          className="booking-input mt-2 min-h-[100px] resize-y text-[14px] leading-relaxed"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "btn-gold inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold",
            (isSaving || !isDirty) && "pointer-events-none opacity-50",
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              Сохраняем…
            </>
          ) : (
            "Сохранить заметку"
          )}
        </button>
        {savedAt && !isDirty && (
          <p className="text-soft text-[12px]">
            Сохранено{" "}
            {new Date(savedAt).toLocaleString("ru-RU", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {error && (
        <p className="booking-alert mt-3 text-[13px] leading-relaxed" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
