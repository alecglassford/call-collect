import twilio from 'twilio';

import db from '../db';
import transcribe from '../transcribe-submission';

const { VoiceResponse } = twilio.twiml;

const getProjectFromPhone = async function getProjectFromPhoneFunc(phone) {
  const safePhone = phone.replace('\'', '');
  try {
    const [project] = await db('projects')
      .select({ filterByFormula: `phone='${safePhone}'`, maxRecords: 1 })
      .firstPage();
    return project;
  } catch (err) {
    console.error(`Failed to get project from phone ${phone}:`);
    console.error(err);
    console.error('😞');
    return null;
  }
};

// TK Is there a better way to query with filterByFormula???
const getPrompt = async function getPromptFunc(projectName, index) {
  const pName = projectName.replace('\'', '');
  try {
    const prompts = await db('prompts')
      .select({
        filterByFormula: `AND(project='${pName}', OR(index=${index}, index=${index + 1}))`,
        sort: [
          { field: 'index', direction: 'asc' },
        ],
      })
      .all();
    return [prompts[0], prompts.length === 1];
  } catch (err) { // not necessarily an error, as we expect this for last segment of call
    console.log(`Failed to get prompt from project ${projectName}, index ${index}:`);
    console.log(err);
    console.log('😕');
    return null;
  }
};

// error handling
const saveRecording = async function saveRecordingFunc(caller, audio, project, index) {
  const projectId = project.id;
  const [prompt, isLast] = await getPrompt(project.fields.name, index);
  if (!prompt || isLast) {
    console.error('Cannot save recording because no prompt or last prompt. Skipping.');
    return;
  }

  try {
    const submission = await db('submissions')
      .create({
        audio,
        caller,
        project: [projectId],
        prompt: [prompt.id],
      });
    console.log(`Saved a recording to ${submission.id}.`);
    transcribe(submission);
  } catch (err) {
    console.error(`Failed to save recording with caller ${caller}, audio ${audio}, projectId ${projectId}, index ${index}:`);
    console.error(err);
    console.error('😞');
  }
};

const buildVoiceResponse = async function buildVoiceResponseFunc(project, index) {
  const vr = new VoiceResponse();
  const [prompt, isLast] = await getPrompt(project.fields.name, index);
  if (!prompt) {
    console.log('No prompt found, so assuming call is done.');
    vr.say('Goodbye!');
  } else {
    const audioUrl = prompt.fields.audio[0].url;
    vr.play(audioUrl);
    if (!isLast) {
      if (index === 0) { // Robo-instructions before 1st recording only
        vr.say('Please leave your first message after the beep and hit pound when you are done.');
      }
      vr.record({
        action: `/api/call/${index + 1}`,
        method: 'POST',
        timeout: 5,
        finishOnKey: '#',
        maxLength: 300,
        playBeep: true,
        trim: 'do-not-trim',
      });
    }
  }
  return vr.toString();
};

export default async function handleCall(req, res) {
  const index = +req.params.index;
  const { To, From, RecordingUrl } = req.body; // More here, e.g. geo, recording duration TK
  const project = await getProjectFromPhone(To);
  if (!project) {
    res.sendStatus(500);
    return;
  }

  if (RecordingUrl) saveRecording(From, RecordingUrl, project, index - 1);

  const vrString = await buildVoiceResponse(project, index);
  res.send(vrString);
}
