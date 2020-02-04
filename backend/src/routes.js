import { Router } from 'express';

import VideoController from './app/controllers/VideoController';

const routes = new Router();

routes.get('/', VideoController.index);

export default routes;
