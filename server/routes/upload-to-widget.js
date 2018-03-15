import db from '../db';
import transcribe from '../transcribe-submission';

const saveAndTranscribe = async function saveAndTranscribeFunc(req) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { contact, projectId, promptId } = req.body;
  const filePath = encodeURIComponent(req.file.path);
  const fileMime = encodeURIComponent(req.file.mimetype);
  const submission = await db('submissions').create({
    caller: `${contact} (${req.ip})`,
    project: [projectId],
    prompt: [promptId],
    widget_audio: [{ url: `${hostname}/api/temp?filepath=${filePath}&mimetype=${fileMime}` }],
    audio: req.file.filename, // This is just a meaningless unique ID really
  });
  transcribe(submission);
};

// Respond to request *immediately*
// Caller won't know if there's an error, buut it's a lot quicker this way!
export default async function uploadToWidget(req, res) {
  saveAndTranscribe(req).catch((err) => {
    console.error('Error saving and transcribing from widget:', err);
  });
  res.sendStatus(200);
}
