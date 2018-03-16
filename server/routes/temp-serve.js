export default function tempServe(req, res) {
  const { filepath, mimetype } = req.query;
  if (!filepath.startsWith('/tmp/cc-tmp-storage')) {
    res.sendStatus(400);
    return;
  }
  res.sendFile(filepath, { headers: { 'Content-Type': mimetype } }, (err) => {
    if (err) {
      console.error(`Error sending file at ${filepath}`);
      console.error(err);
      console.error('😞');
      return;
    }
    console.log(`Sent file from ${filepath}`);
  });
}
