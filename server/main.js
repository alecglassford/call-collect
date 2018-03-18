import compression from 'compression';
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
import widgetData from './routes/widget-data';
import uploadToWidget from './routes/upload-to-widget';

const app = express();
app.use(compression());
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/cc-tmp-storage', // TK make more flexible?
  }),
});

// Widget/public routes
app.use(express.static('public'));
app.get('/widget/:projectId', (req, res) => { res.sendFile(`${__dirname}/client/widget/index.html`); });
app.get('/api/widget/:projectId', widgetData);
app.post('/api/widget', upload.single('audio'), uploadToWidget);
app.post('/api/call/:index', express.urlencoded({ extended: true }), handleCall);
app.get('/api/temp', tempServe);

// Login routes
app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/client/login.html`);
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

// Authentication - every route after here requires PASSPHRASE cookie
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.cookies.PASSPHRASE !== process.env.PASSPHRASE) {
    if (req.path.startsWith('/api/') || req.path.startsWith('/widget/')) {
      res.sendStatus(403);
    } else res.redirect('/login');
  } else {
    next();
  }
});

app.get('/api/projects', getProjectNames);
app.get('/api/prompts/:projectName', getPrompts);
app.put('/api/prompts/:projectName', express.json(), reorderPrompts);
app.get('/api/submissions/:projectName', getSubmissions);
app.post('/api/projects', express.json(), newProject);
app.post('/api/prompts', upload.single('promptAudio'), newPrompt);

// Catch everything else --> /api/... and /widget/... 404, others redirect home
app.get('/api/*', (req, res) => { res.sendStatus(404); });
app.get('/widget/*', (req, res) => { res.sendStatus(404); });
app.get('/*', (req, res) => { res.sendFile(`${__dirname}/client/app/index.html`); });

app.listen(process.env.PORT || 3000, () => {
  console.log('👨‍🏫🎙 I\'m listening.');
});
