import db from '../db';

export default async function getPrompts(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { projectName } = req.params;
  try {
    while (true) { // eslint-disable-next-line no-await-in-loop
      const prompts = await db('prompts').select({
        filterByFormula: `project='${projectName}'`,
        sort: [{ field: 'index', direction: 'asc' }],
      }).all();
      // Make sure we don't have any temp-serve URLs for audio.
      if (prompts.every((p) => {
        if (!p.fields.audio) throw Error('Prompt is missing audio.'); // bad :(
        return !p.fields.audio[0].url.startsWith(hostname); // wait + loop back
      })) {
        res.json(prompts);
        return;
      }
      // If we do, wait a second and try again (hopefully Airable will have processed)
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 1000); });
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
