export function normalizePhone(phone) {
  if (!phone) return null;


  let cleaned = phone.replace(/[\s\-()]/g, "");


  if (/^0\d{10}$/.test(cleaned)) {
    cleaned = "+20" + cleaned.slice(1);
  }


  else if (/^20\d{10}$/.test(cleaned)) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}