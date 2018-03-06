import db from '../db';
import getPrompts from './get-prompts';

export default async function reorderPrompts(req, res) {
  try {
    const changed = req.body.map(async ([promptId, index], iterIndex) => {
      // Avoid rate limit: parallel, but wait 0 for the 0th, 300 for the 1st, etc.
      // Effectively serial ... but functional ... whatever ...
      await new Promise((resolve) => { setTimeout(resolve, iterIndex * 300); });
      return db('prompts').update(promptId, { index });
    });
    await Promise.all(changed);
    getPrompts(req, res);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
