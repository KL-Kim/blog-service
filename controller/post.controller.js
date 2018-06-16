/**
 * Post controller
 *
 * @export {Class}
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Post from '../models/post.model';

class PostController extends BaseController {

  /**
   * Get posts list
   * @role - *
   * @since 0.0.1
   * @property {Number} req.query.skip - Number of list to skip
   * @property {Number} req.query.limit - Number of list to limit
   * @property {ObjectId} req.query.uid - Author user id
   * @property {String} req.query.search - Search term
   * @property {String} req.query.status - Post status
   */
  getList(req, res, next) {
    const { skip, limit, uid, search } = req.query;

    const filter = {
      uid,
      status: 'PUBLISHED'
    };

    Post.getCount({ search, filter })
      .then(count => {
        req.count = count;

        return Post.getList({ skip, limit, search, filter});
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
   * @role - *
   * @since 0.0.1
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
   * @role - writer, manager, admin
   * @since 0.0.1
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
        if (payload.role === 'writer' || payload.role === 'manager' || payload.role === 'admin') throw new APIError("Forbidden", httpStatus.FORBIDDEN);

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
   * @role - writer, manager, admin
   * @since 0.0.1
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
        if (payload.role === 'writer' || payload.role === 'manager' || payload.role === 'admin') throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Post.findById(req.params.id);
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
   * @role - writer, manager, admin
   * @since 0.0.1
   * @property {ObjectId} req.params.id - Post id
   * @property {ObjectId} req.body.authorId - User id
   */
  deletePost(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (req.body.authorId !== payload.uid) throw new APIError("Forbidden", httpStatus.FORBIDDEN);
        if (payload.role === 'writer' || payload.role === 'manager' || payload.role === 'admin') throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Post.findById(req.params.id);
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
   * Vote post
   * @role - *
   * @since 0.0.1
   * @property {ObjectId} req.body.uid - User id
   * @property {String} req.body.vote - Upvote or downvote
   */
  votePost(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (req.body.uid !== payload.uid) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Post.findById(req.params.id);
      })
      .then(post => {
        if (_.isEmpty(post)) throw new APIError("Not found", httpStatus.NOT_FOUND);
        if (post.authorId.toString() === req.body.uid) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        const upIndex = post.upvote.indexOf(req.body.uid);
        const downIndex = post.downvote.indexOf(req.body.uid);

        if (req.body.vote === 'UPVOTE') {
          if (upIndex > -1) {
            post.upvote.splice(upIndex, 1);
          } else {
            if (downIndex > -1) {
              post.downvote.splice(downIndex, 1);
            }

            post.upvote.push(req.body.uid);
          }
        } else if (req.body.vote === 'DOWNVOTE') {
          if (downIndex > -1) {
            post.downvote.splice(downIndex, 1);
          } else {
            if (upIndex > -1) {
              post.upvote.splice(upIndex , 1);
            }

            post.downvote.push(req.body.uid);
          }
        }

        return post;
      })
      .then(post => {
        return post.save();
      })
      .then(post => {
        return res.json({
          post
        });
      })
      .catch(err => {
        return next(err);
      })
  }

  /**
   * Report post
   * @role - *
   * @since 0.0.1
   * @property {ObjectId} req.params.id - Post Id
   * @property {String} req.body.type - Report type
   * @property {String} req.body.content - Report content
   * @property {String} req.body.contact - User contact
   */
  reportPost(req, res, next) {
    Post.findById(req.params.id)
      .then(post => {
        if (_.isEmpty(post)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        const { type, content, contact } = req.body;

        post.reports.push({
          type,
          content,
          contact,
        });

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
   * Get posts list by admin
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {Number} req.query.skip - Number of list to skip
   * @property {Number} req.query.limit - Number of list to limit
   * @property {ObjectId} req.query.uid - Author user id
   * @property {String} req.query.search - Search term
   * @property {String} req.query.status - Post status
   */
  getPostsListByAdmin(req, res, next) {
    PostController.authenticate(req, res, next)
      .then(payload => {
        if (payload.role !== 'manager' && payload.role !== 'admin' && payload.role !== 'god')
          throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        const { skip, limit, uid, search, status } = req.query;

        const filter = {
          uid,
          status,
        };

        return Post.getCount({ search, filter });
      })
      .then(count => {
        req.count = count;

        return Post.getList({ skip, limit, search, filter});
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
   * Update post state by admin
   * @role - manager, admin, god
   * @since 0.0.1
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
   * @since 0.0.1
	 * @returns {Promise<Object, APIError>}
   */
  static authenticate(req, res, next) {
 		return new Promise((resolve, reject) => {
 			passport.authenticate('access-token', (err, payload, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        return resolve(payload);
 			})(req, res, next);
 		});
 	}
}

export default PostController;
