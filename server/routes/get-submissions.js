import db from '../db';

export default async function getSubmissions(req, res) {
  const { projectName } = req.params;
  const pName = projectName.replace('\'', '');
  try {
    const submissions = await db('submissions').select({
      filterByFormula: `project='${pName}'`,
      sort: [
        { field: 'timestamp', direction: 'asc' },
        { field: 'prompt', direction: 'asc' },
      ],
    }).all();
    res.json(submissions.map(s => s._rawJson)); // eslint-disable-line no-underscore-dangle
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
