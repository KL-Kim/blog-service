import Express from 'express';
import validate from 'express-validation';

import paramValidation from '../../config/param-validation';
import BlogController from '../../controller/blog.controller';

const router = Express.Router();
const blogController = new BlogController();

/** GET /api/v1/blog - Get blog list **/
router.get('/', blogController.getList);

export default router;
