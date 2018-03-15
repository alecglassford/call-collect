import { randomBytes } from 'crypto';
import { basename } from 'path';

import speech from '@google-cloud/speech';
import Storage from '@google-cloud/storage';

import db from './db';

const createBucket = async function createBucketFunc(storage) {
  const name = `call-collect-${randomBytes(16).toString('hex')}`;
  const bucket = storage.bucket(name);
  await bucket.create({ storageClass: 'regional', location: 'us-west1' }); // TK customizable
  console.log(`created bucket ${name}`);
  return bucket;
};

const getBucket = async function getBucketFunc(storage) {
  try {
    const [buckets] = await storage.getBuckets();
    console.log('here are the buckets', buckets.map(b => b.name));
    return buckets.find(b => b.name.startsWith('call-collect')) || createBucket(storage);
  } catch (err) {
    console.error('Error getting or creating Google Cloud Storage bucket');
    console.error(err);
    console.error('😞');
    return null;
  }
};

let transcribe;

if (process.env.GOOGLE_CREDS_STRING === undefined) {
  console.log('No GOOGLE_CREDS_STRING found, disabling transcription.');
  transcribe = function transcribeNoop() {
  };
} else {
  const credentials = JSON.parse(process.env.GOOGLE_CREDS_STRING);
  const sc = new speech.v1.SpeechClient({ credentials });
  const storage = new Storage({ credentials });
  const bucketPromise = getBucket(storage);

  const saveTranscription = async function saveTranscriptionFunc(prelim, submissionId) {
    await db('submissions').update(submissionId, { transcript: 'Transcription in progress.' });
    console.log('updated db with a prelim');
    const final = await prelim[0].promise();
    const transcript = final[0].results
      .map(result => result.alternatives[0].transcript)
      .join(' ');
    console.log('transcript');
    console.log(transcript);
    await db('submissions').update(submissionId, { transcript });
    console.log('updated db with a final');
  };

  // Airtable may not have our audio yet, so we'll retry until we get it.
  const noTempAudio = async function noTempAudioFunc(submission, count) {
    const audioUrl = submission.fields.widget_audio[0].url; // dl.airtable.com/...
    if (audioUrl.includes('/api/temp?filepath=')) { // TK better test
      if (count > 10) throw new Error('Failed to get Airtable audio.'); // TK better msg

      await new Promise((resolve) => { setTimeout(resolve, 10000); });
      const newSub = await db('submissions').find(submission.id);
      return noTempAudio(newSub, count + 1);
    }
    return audioUrl;
  };

  const submissionToBucket = async function submissionToBucketFunc(submission, bucket) {
    let audioUrl = submission.fields.audio; // correct if submitted by phone

    if (submission.fields.widget_audio) { // if uploaded by widget, change
      // Airtable has been somewhat dubious so I'm going to say wait a whole
      // 30 seconds right now to make sure the whole file is getting uploaded.
      await new Promise((resolve) => { setTimeout(resolve, 30000); });
      audioUrl = await noTempAudio(submission, 0);
    }

    await bucket.upload(audioUrl);
    return basename(audioUrl);
  };

  transcribe = async function transcribeSubmission(submission) {
    const submissionId = submission.id;
    console.log(submissionId);
    try {
      const bucket = await bucketPromise; // should be resolved by now, probably
      const gcsFilename = await submissionToBucket(submission, bucket);

      const prelimResult = await sc.longRunningRecognize({
        config: {
          encoding: 'LINEAR16',
          languageCode: 'en-US', // TK allow other languages
          maxAlternatives: 1, // TK change this?
          profanityFilter: false,
          enableWordTimeOffsets: false, // TK add these
        },
        audio: {
          uri: `gs://${bucket.name}/${gcsFilename}`,
        },
      });
      saveTranscription(prelimResult, submissionId);
    } catch (err) { // TK improve error handling
      console.error(err);
    }
  };
}

export default function transcribeWrapper(submissionId) {
  transcribe(submissionId);
}
