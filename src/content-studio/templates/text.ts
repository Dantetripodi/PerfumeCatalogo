export const STORY_FRAME_MAX_LENGTH = 72;
export const REEL_TEXT_MAX_LENGTH = 60;

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  if (maxLength <= 1) return "…".slice(0, maxLength);

  const availableLength = maxLength - 1;
  const candidate = value.slice(0, availableLength);
  const nextCharacter = value[availableLength];
  const cutAt = /\s/.test(nextCharacter ?? "")
    ? availableLength
    : candidate.lastIndexOf(" ");
  const wordSafeCandidate = cutAt > 0 ? candidate.slice(0, cutAt).trimEnd() : candidate;

  return `${wordSafeCandidate}…`;
}
