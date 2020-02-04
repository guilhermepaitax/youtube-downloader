import ytdl from 'ytdl-core';
import * as Yup from 'yup';

class VideoController {
  async index(req, res) {
    const schema = Yup.object().shape({
      url: Yup.string()
        .url()
        .required(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { url } = req.query;

    if (!ytdl.validateURL(url)) {
      return res.status(401).json({ error: 'Invalid URL.' });
    }

    res.header('Content-Disposition', 'attachment; filename="video.mp4"');

    return ytdl(url, {
      format: 'mp4',
      quality: 'highestvideo',
    }).pipe(res);
  }
}

export default new VideoController();
