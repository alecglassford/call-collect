export const humanPhone = function humanPhoneFunc(phone) {
  if (!phone) return 'No phone number';
  if (!phone.startsWith('+') || !phone.length === 12) return phone;
  return `${phone.substring(2, 5)}-${phone.substring(5, 8)}-${phone.substring(8, 12)}`;
};

// TK this is a dumb function, man. Switch out for just adding 1 everywhere.
export const humanIndex = function humanIndexFunc(index) {
  return index + 1;
};

export const subToPromptName = function subToPromptNameFunc(sub, currentPrompts) {
  const promptId = sub.fields.prompt[0];
  const prompt = currentPrompts.find(p => p.id === promptId);
  return prompt.fields.slug || `Prompt ${prompt.fields.index + 1}`;
};
