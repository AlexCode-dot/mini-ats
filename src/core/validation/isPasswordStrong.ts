export const MIN_PASSWORD_LENGTH = 8;

export function isPasswordStrong(value: string) {
  return value.trim().length >= MIN_PASSWORD_LENGTH;
}
