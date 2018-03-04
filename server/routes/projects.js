import db from '../db';

export default async function getProjects(req, res) {
  try {
    const projects = await db('projects').select({
      sort: [{ field: 'name', direction: 'asc' }],
    }).all();
    res.json(projects);
  } catch (err) {
    res.sendStatus(500);
  }
}
