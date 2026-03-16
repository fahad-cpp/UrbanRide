/**
 * Strips all non-digit characters from a phone string.
 */
export function digitsOnly(value) {
  return value.replace(/\D/g, '')
}

/**
 * Formats an Indian mobile number as "XXXXX XXXXX" as the user types.
 * Passes through numbers starting with +91 unchanged.
 */
export function formatPhoneInput(raw) {
  // Let the user type +91 prefix freely — don't reformat
  if (raw.startsWith('+')) return raw

  const digits = digitsOnly(raw)

  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`
}

/**
 * Returns an error string if the phone number is invalid, or '' if valid.
 * Indian mobile rules:
 *   - Domestic: exactly 10 digits, first digit must be 6, 7, 8 or 9
 *   - International: +91 followed by a valid 10-digit Indian mobile
 *   - Empty string = valid (caller enforces required)
 */
export function validatePhone(value) {
  const trimmed = value.trim()

  if (!trimmed) return ''

  // International format: +91 followed by 10 digits starting with 6-9
  if (trimmed.startsWith('+')) {
    const withoutPlus = trimmed.slice(1).replace(/\s/g, '')
    if (!withoutPlus.startsWith('91')) {
      return 'Only Indian numbers are supported. Use +91 followed by your 10-digit number.'
    }
    const localDigits = withoutPlus.slice(2)
    if (localDigits.length !== 10) {
      return 'Please enter a valid 10-digit Indian mobile number after +91.'
    }
    if (!/^[6-9]/.test(localDigits)) {
      return 'Indian mobile numbers must start with 6, 7, 8 or 9.'
    }
    return ''
  }

  // Domestic: exactly 10 digits, starting with 6-9
  const digits = digitsOnly(trimmed)
  if (digits.length !== 10) {
    return 'Please enter a valid 10-digit Indian mobile number, e.g. 98765 43210.'
  }
  if (!/^[6-9]/.test(digits)) {
    return 'Indian mobile numbers must start with 6, 7, 8 or 9.'
  }

  return ''
}