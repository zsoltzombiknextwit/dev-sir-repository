/**
 * Returns up to 2 uppercase initials from a display name.
 * e.g. "John Doe" → "JD", "Alice" → "A"
 */
export function getInitials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
