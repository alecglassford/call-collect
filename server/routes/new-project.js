import db from '../db';
import twilioClient from '../twilio-client';

const newPhoneNumber = async function newPhoneNumberFunc(name, areaCode, hostname) {
  // TK add error handling and more customization
  try {
    const { phoneNumber } = await twilioClient.incomingPhoneNumbers.create({
      friendlyName: name,
      areaCode,
      voiceUrl: `${hostname}/api/call/0`,
      voiceMethod: 'POST',
      voiceCallerIdLookup: false, // For now to save 1 cent per call (TK)
      apiVersion: '2010-04-01',
    });
    return phoneNumber;
  } catch (err) {
    console.error('Error creating phone number:', err);
    return '';
  }
};

const stealPhoneNumber = async function stealPhoneNumberFunc(targetProjectId) {
  try {
    const targetProject = await db('projects').find(targetProjectId);
    const { phone } = targetProject.fields;
    if (phone) await db('projects').update(targetProjectId, { phone: '' });
    return phone;
  } catch (err) {
    console.error('Error stealing phone number:', err);
    return '';
  }
};

export default async function newProject(req, res) {
  // error handling TK
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  // eslint-disable-next-line object-curly-newline
  const { name, description, areaCode, stealPhone } = req.body;
  const safeName = name.replace('\'', '');
  let phone = '';
  if (areaCode) phone = await newPhoneNumber(safeName, areaCode, hostname);
  else if (stealPhone) phone = await stealPhoneNumber(stealPhone);
  try {
    const newProjectRecord = await db('projects').create({ safeName, description, phone });
    res.send(newProjectRecord._rawJson); // eslint-disable-line no-underscore-dangle
  } catch (err) {
    res.sendStatus(500);
  }
}
