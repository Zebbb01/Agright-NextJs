// src\lib\helpers\convertDMSToDecimal.ts
export function convertDMSToDecimal(dmsString: string, ref: string): number | null {
  if (!dmsString || !ref) return null;

  const parts = dmsString.match(/(\d+) deg (\d+)' ([\d.]*)"/);
  if (!parts || parts.length < 4) return null;

  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === 'S' || ref === 'W') {
    decimal *= -1;
  }
  return decimal;
}
