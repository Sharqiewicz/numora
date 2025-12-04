export const removeNonNumericCharacters = (value: string, allowNegative = false): string => {
  if (!allowNegative) {
    return value.replace(/[^0-9.]/g, '');
  }

  const hasLeadingMinus = value.startsWith('-');
  const numericOnly = value.replace(/[^0-9.]/g, '');
  
  if (hasLeadingMinus) {
    if (numericOnly.length > 0) {
      return '-' + numericOnly;
    }
    if (value === '-') {
      return '-';
    }
  }
  
  return numericOnly;
};