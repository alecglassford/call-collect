import cookieParser from 'cookie-parser';
import express from 'express';
import multer from 'multer';

import getProjectNames from './routes/projects';
import getPrompts from './routes/get-prompts';
import reorderPrompts from './routes/reorder-prompts';
import getSubmissions from './routes/get-submissions';
import newProject from './routes/new-project';
import newPrompt from './routes/new-prompt';
import handleCall from './routes/handle-call';
import tempServe from './routes/temp-serve';

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/cc-tmp-storage', // TK make more flexible?
  }),
});

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/public/login.html`);
});
app.post('/login', express.json(), (req, res) => {
  if (req.body.PASSPHRASE === process.env.PASSPHRASE) {
    const encodedPass = encodeURIComponent(req.body.PASSPHRASE);
    res.set('Set-Cookie', `PASSPHRASE=${encodedPass}`);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

app.use(cookieParser());
app.use((req, res, next) => {
  if (req.cookies.PASSPHRASE !== process.env.PASSPHRASE) {
    if (req.path.startsWith('/api/')) res.sendStatus(403);
    else res.redirect('/login');
  } else {
    next();
  }
});

app.use(express.static('public'));
app.get('/api/projects', getProjectNames);
app.get('/api/prompts/:projectName', getPrompts);
app.put('/api/prompts/:projectName', express.json(), reorderPrompts);
app.get('/api/submissions/:projectName', getSubmissions);
app.post('/api/projects', express.json(), newProject);
app.post('/api/prompts', upload.single('promptAudio'), newPrompt);
app.post('/api/call/:index', express.urlencoded({ extended: true }), handleCall);
app.get('/api/temp', tempServe);
app.get('/*', (req, res) => { res.sendFile(`${__dirname}/public/index.html`); });

app.listen(process.env.PORT || 3000, () => {
  console.log('👨‍🏫🎙 I\'m listening.');
});
