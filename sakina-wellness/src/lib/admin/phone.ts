/** Normalize phone for client grouping and WhatsApp (Kazakhstan) */
export function normalizeClientPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("8") && digits.length === 11) {
    return `7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `7${digits}`;
  }

  return digits;
}

export function formatClientPhoneDisplay(phoneKey: string): string {
  const digits = phoneKey.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  if (digits.length >= 10) {
    return `+${digits}`;
  }
  return phoneKey;
}

export function isValidClientPhoneKey(phoneKey: string): boolean {
  const digits = phoneKey.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
