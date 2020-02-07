import ytdl from 'ytdl-core';
import * as Yup from 'yup';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const stream = require('merge-stream');

// const ffmpeg = require('fluent-ffmpeg');

class VideoController {
  async index(req, res) {
    const schema = Yup.object().shape({
      url: Yup.string()
        .url()
        .required(),
    });

    // quality, filter, range, begin
    const { url } = req.query;

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(401).json({ error: 'Invalid URL.' });
    }

    const audioOutput = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'temp',
      'sound.mp4'
    );
    const mainOutput = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'temp',
      'output.mp4'
    );

    const onProgress = (chunkLength, downloaded, total) => {
      const percent = downloaded / total;
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
      process.stdout.write(
        `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(
          total /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );
    };

    // res.header('Content-Disposition', 'attachment; filename="video.mp4"');

    const audio = await ytdl(url, {
      filter: format => format.container === 'mp4' && !format.qualityLabel,
      quality: 'highestaudio',
    })
      .on('error', console.error)
      .on('progress', onProgress)
      .pipe(fs.createWriteStream(audioOutput));

    return res.json(audioOutput);

    return ytdl(url, {
      filter: format => format.container === 'mp4' && !format.qualityLabel,
    })
      .on('error', console.error)
      .on('progress', onProgress)
      .pipe(fs.createWriteStream(audioOutput))
      .on('finish', () => {
        console.log('\ndownloading video');
        const video = ytdl(url, {
          filter: format => format.container === 'mp4' && !format.audioEncoding,
        });
        video.on('progress', onProgress).pipe(fs.createWriteStream(mainOutput));

        // const merged = mergeStream(video, audioOutput);
        // merged.add(mainOutput);
        // merged.isEmpty();

        // ffmpeg()
        //   .input(video)
        //   .videoCodec('copy')
        //   .input(audioOutput)
        //   .audioCodec('copy')
        //   .save(mainOutput)
        //   .on('error', console.error)
        //   .on('end', () => {
        //     fs.unlink(audioOutput, err => {
        //       if (err) console.error(err);
        //       else
        //         console.log(`\nfinished downloading, saved to ${mainOutput}`);
        //     });
        //   });
      });

    // return ytdl(url, {
    //   format: 'mp3',
    //   quality: 'highestaudio',
    //   // filter: 'audioonly',
    // }).pipe(res);
  }
}

export default new VideoController();
