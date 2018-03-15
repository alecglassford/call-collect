export const humanPhone = function humanPhoneFunc(phone) {
  if (!phone) return 'No phone number';
  if (!phone.startsWith('+') || !phone.length === 12) return phone;
  return `${phone.substring(2, 5)}-${phone.substring(5, 8)}-${phone.substring(8, 12)}`;
};

// TK this is a dumb function, man. Switch out for just adding 1 everywhere.
export const humanIndex = function humanIndex(index) {
  return index + 1;
};
