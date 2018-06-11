import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Post from '../models/post.model';

class PostController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get posts list
   * @property {Number} req.query.skip - Number of list to skip
   * @property {Number} req.query.limit - Number of list to limit
   * @property {ObjectId} req.query.uid - Author user id
   * @property {String} req.query.search - Search term
   * @property {String} req.query.status - Post status
   */
  getList(req, res, next) {
    const { skip, limit, uid, search, status } = req.query;

    Post.getCount({
      search,
      filter:
      {
        uid,
        status,
      }
    }).then(count => {
        req.count = count;

        return Post.getList({ skip, limit, search, filter: {
          uid,
          status
        }});
      })
      .then(list => {
        return res.json({
          totalCount: req.count,
          list
        });
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Get single post
   * @property {ObjectId} req.params.id - Post id
   */
  getSinglePost(req, res, next) {
    Post.getById(req.params.id)
      .then(post => {
        if (_.isEmpty(post)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        post.viewsCount = post.viewsCount + 1;
        return post.save();
      })
      .then(post => {
        return res.json({post});
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Add new post
   * @property {ObjectId} req.body.authorId - Auther user id
   * @property {String} req.body.title - Post title
   * @property {String} req.body.summary - Post summary
   * @property {String} req.body.content - Post content
   * @property {Array} req.body.keywords - Post keyword
   * @property {String} req.body.status - Post status
   */
  addNewPost(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (req.body.authorId !== payload.uid) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        const { authorId, title, summary, content, keywords, status } = req.body;

        const post = new Post({
          authorId,
          title,
          summary,
          content,
          keywords,
          status,
        });

        if (status === 'PUBLISHED') {
          post.publishedAt = Date.now();
        }

        return post.save();
      })
      .then(post => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Update post
   * @property {ObjectId} req.params.id - Post id
   * @property {ObjectId} req.body.authorId - Auther user id
   * @property {String} req.body.title - Post title
   * @property {String} req.body.summary - Post summary
   * @property {String} req.body.content - Post content
   * @property {Array} req.body.keywords - Post keyword
   * @property {String} req.body.status - Post status
   */
  updatePost(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (req.body.authorId !== payload.uid) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Post.getById(req.params.id);
      })
      .then(post => {
        if (_.isEmpty(post)) throw new APIError("Not found", httpStatus.NOT_FOUND);
        if (post.authorId.toString() !== req.body.authorId) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        let publishedAt;

        // Set publish time
        if (post.status !== 'PUBLISHED' && req.body.status === 'PUBLISHED') {
          publishedAt = Date.now();
        }

        return post.update({
          ...req.body,
          publishedAt,
          updatedAt: Date.now(),
        });
      })
      .then(result => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete post
   * @property {ObjectId} req.params.id - Post id
   */
  deletePost(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (req.body.authorId !== payload.uid) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Post.getById(req.params.id);
      })
      .then(post => {
        if (_.isEmpty(post)) throw new APIError("Not found", httpStatus.NOT_FOUND);
        if (post.authorId.toString() !== req.body.authorId) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        post.remove();
      })
      .then(result => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      })
  }

  /**
   * Update post state by admin
   * @property {ObjectId} req.params.id - Post id
   * @property {String} req.body.state - Post state
   */
  updatePostByAdmin(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (payload.role !== 'manager' && payload.role !== 'admin' && payload.role !== 'god')
          throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Post.getById(req.params.id);
      })
      .then(post => {
        if (_.isEmpty(post)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        return post.update({ state: req.body.state });
      })
      .then(result => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Authenticate
   */
  static authenticate(req, res, next) {
 		return new Promise((resolve, reject) => {
 			passport.authenticate('access-token', (err, payload, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        if (payload.isVerified) {
          return resolve(payload);
        } else {
          reject(new APIError("Forbidden", httpStatus.FORBIDDEN));
        }
 			})(req, res, next);
 		});
 	}
}

export default PostController;
