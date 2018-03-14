import db from '../db';

export const cleanPrompts = async function cleanPromptsFunc(pName, hostname) {
  try {
    while (true) { // eslint-disable-next-line no-await-in-loop
      const prompts = await db('prompts').select({
        filterByFormula: `project='${pName}'`,
        sort: [{ field: 'index', direction: 'asc' }],
      }).all();

      // Make sure we don't have any temp-serve URLs for audio.
      if (prompts.every((p) => {
        if (!p.fields.audio) throw Error('Prompt is missing audio.'); // bad :(
        return !p.fields.audio[0].url.startsWith(hostname); // wait + loop back
      })) {
        return prompts;
      }

      // If we do, wait a second and try again
      // (hopefully Airable will have processed)
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 1000); });
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default async function getPrompts(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { projectName } = req.params;
  const pName = projectName.replace('\'', '');
  const prompts = await cleanPrompts(pName, hostname);
  if (prompts) {
    res.json(prompts.map(p => p._rawJson)); // eslint-disable-line no-underscore-dangle
  } else {
    res.sendStatus(500);
  }
}
