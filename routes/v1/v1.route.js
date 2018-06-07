import Express from 'express';
import postRoute from './post.route';

const router = Express.Router();

router.use('/post', postRoute);

export default router;
