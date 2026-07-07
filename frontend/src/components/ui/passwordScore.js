/** Rough 0-4 password strength score. Length is what the backend actually
 * enforces (>6 chars); case/number/symbol only push the score higher. */
export function passwordScore(pw = "") {
  let score = 0;
  if (pw.length >= 7) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export const STRENGTH_LABEL = ["Muy débil", "Débil", "Regular", "Fuerte", "Excelente"];
