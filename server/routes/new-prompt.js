import db from '../db';

// audio has been saved to req.file.path
// and we have req.body.projectId, req.body.index
export default async function newPrompt(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { index, slug, projectId } = req.body;
  const filePath = encodeURIComponent(req.file.path);
  const fileMime = encodeURIComponent(req.file.mimetype);
  try {
    await db('prompts').create({
      slug,
      index: +index,
      project: [projectId],
      audio: [{ url: `${hostname}/api/temp?filepath=${filePath}&mimetype=${fileMime}` }],
    });
    res.sendStatus(200);
    // No point in sending actual prompt obj, because audio won't be ready in Airtable
    // Instead we'll just refetch from get-prompts if needed: one source of prompt data
    // May be slower, but easier to deal with, and we'll check there to make sure audio is ready
  } catch (err) {
    res.sendStatus(500);
  }
}
