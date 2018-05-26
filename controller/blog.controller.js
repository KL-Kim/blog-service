import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Blog from '../models/blog.model';

class BlogController extends BaseController {
  constructor() {
    super();
  }

  getList(req, res, next) {
    return res.json('Get blog list');
  }

  addNewBlog(req, res, next) {
    Blog.authenticate(req, res, next)
      .then()
  }

  /**
   * Authenticate
   */
  static authenticate(req, res, next) {
 		return new Promise((resolve, reject) => {
 			passport.authenticate('access-token', (err, role, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        if (payload.uid !== req.body.uid) {
          reject(new APIError("Forbidden", httpStatus.FORBIDDEN));
        } else {
          return resolve(payload.role);
        }
 			})(req, res, next);
 		});
 	}
}

export default BlogController;
