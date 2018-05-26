import Express from 'express';
import blogRoute from './blog.route';

const router = Express.Router();

router.use('/blog', blogRoute);

export default router;
