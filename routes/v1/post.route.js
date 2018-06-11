import Express from 'express';
import validate from 'express-validation';

import paramValidation from '../../config/param-validation';
import PostController from '../../controller/post.controller';

const router = Express.Router();
const postController = new PostController();

/** GET /api/v1/post - Get post list **/
router.get('/', validate(paramValidation.getList), postController.getList);

/** POST /api/v1/post - Add new post **/
router.post('/', validate(paramValidation.addNewPost), postController.addNewPost);

/** GET /api/v1/post/single/:id - Get single post **/
router.get('/single/:id', validate(paramValidation.getSinglePost), postController.getSinglePost);

/** PUT /api/v1/post/:id - Update post **/
router.put('/single/:id', validate(paramValidation.updatePost), postController.updatePost);

/** DELETE /api/v1/post:id - Delete post **/
router.delete('/single/:id', validate(paramValidation.deletePost), postController.deletePost);

/** PUT /api/v1/post/admin/:id - Update post state by admin **/
router.put('/admin/:id', validate(paramValidation.updatePostByAdmin),postController.updatePostByAdmin);

export default router;
