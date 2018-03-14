export default async function uploadToWidget(req, res) {
  // tk actually deal with the upload
  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  res.sendStatus(200);
}
