import db from '../db';

import { cleanPrompts } from './get-prompts';


export default async function widgetData(req, res) {
  const hostname = `${req.protocol}://${req.hostname}`;
  const { projectId } = req.params;

  const project = await db('projects').find(projectId);
  const prompts = await cleanPrompts(project.fields.name, hostname);
  const enabledPrompts = prompts.filter(p => p.fields.index !== -1);

  res.json({
    name: project.fields.name,
    desc: project.fields.description,
    phone: project.fields.phone,
    prompts: enabledPrompts.map(p => ({
      id: p.id,
      slug: p.fields.slug,
      audio: p.fields.audio[0].url,
    })),
  });
}
