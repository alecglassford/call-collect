export const humanPhone = function humanPhoneFunc(phone) {
  if (!phone) return 'No phone number';
  if (!phone.startsWith('+') || !phone.length === 12) return phone;
  return `${phone.substring(2, 5)}-${phone.substring(5, 8)}-${phone.substring(8, 12)}`;
};

export const humanIndex = function humanIndex(index) {
  return index + 1;
};
