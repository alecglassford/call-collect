import db from '../db';

export default async function uploadToWidget(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { contact, projectId, promptId } = req.body;
  const filePath = encodeURIComponent(req.file.path);
  const fileMime = encodeURIComponent(req.file.mimetype);
  console.log(hostname, contact, projectId, promptId, filePath, fileMime);
  try {
    await db('submissions').create({
      caller: `${contact} (${req.ip})`,
      project: [projectId],
      prompt: [promptId],
      widget_audio: [{ url: `${hostname}/api/temp?filepath=${filePath}&mimetype=${fileMime}` }],
      audio: req.file.filename, // This is just a meaningless unique ID really
    });
  } catch (err) {
    // TK handle err better
    res.sendStatus(500);
  }
  // tk actually deal with the upload
  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  res.sendStatus(200);
}
