/**
 * Post Model
 *
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

import Promise from 'bluebird';
import mongoose, { Schema } from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';

import APIError from '../helper/api-error';
import config from '../config/config';

const userDB = mongoose.createConnection(config.userMongo.host + ':' + config.userMongo.port + '/' + config.userMongo.name);
const User = userDB.model('User', {});

const PostSchema = new Schema({
  "priority": {
    type: Number,
    default: 0,
    min: 0,
    max: 9,
  },
  "status": {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'TRASH'],
    default: 'DRAFT',
  },
  "state": {
    type: String,
    enum: ['NORMAL', 'SUSPENDED'],
    default: 'NORMAL',
  },
  "authorId": {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  "topic":{
    type: Schema.Types.ObjectId,
    ref: 'Topic'
  },
  "title": {
    type: String,
    required: true,
  },
  "summary": {
    type: String,
  },
  "content": {
    type: String,
    required: true,
    text: true,
  },
  "keywords": [{
    type: String
  }],
  "viewsCount": {
    type: Number,
    required: true,
    default: 0
  },
  "upvote": [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  "downvote": [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  "commentsList": [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  "reports": [{
    "checked": {
      type: Boolean,
      default: false,
    },
    "type": {
      type: String
    },
    "content": {
      type: String
    },
    "contact": {
      type: String
    },
  }],
  "publishedAt":{
    type: Date,
    index: true
  },
  "createdAt": {
    type: Date,
		default: Date.now,
    index: true
  },
});

/**
 * Indexes
 */
PostSchema.index({
  "priority": -1,
  "createdAt": -1
});

/**
 * Virtuals
 */
PostSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
PostSchema.methods = {
  /**
	 * Remove unnecessary info
	 */
  toJSON() {
		let obj = this.toObject();
		delete obj.__v;
		return obj;
	},
};

/**
 * Statics
 */
PostSchema.statics = {
  /**
	 * List posts in descending order of 'createdAt' timestamp.
   * @param {String} search - Search term
	 * @returns {Promise<Post[]>}
	 */
	getList({ skip = 0, limit = 10, search, filter = {} } = {}) {
    let conditions,
        userCondition,
        statusCondition,
        searchCondition,
        stateCondition;

    if (filter.uid) {
      userCondition = {
        "authorId": filter.uid,
      };
    }

    if (filter.status) {
      statusCondition = {
        "status": filter.status,
      };
    }

    if (filter.state) {
      stateCondition = {
        "state": filter.state,
      };
    }

    const escapedString = _.escapeRegExp(search);

    if (escapedString) {
      searchCondition = {
        "$or": [
          {
            "title": {
              $regex: escapedString,
      				$options: 'i'
            }
          },
          {
            "summary": {
              $regex: escapedString,
      				$options: 'i'
            }
          },
          {
            "content": {
              $regex: escapedString,
      				$options: 'i'
            }
          }
        ]
      }
    }

    if (userCondition || searchCondition || statusCondition || stateCondition) {
      conditions = {
        "$and": [
          _.isEmpty(searchCondition) ? {} : searchCondition,
          _.isEmpty(userCondition) ? {} : userCondition,
          _.isEmpty(statusCondition)? {} : statusCondition,
          _.isEmpty(stateCondition)? {} : stateCondition,
        ]
      }
    }

		return this.find(_.isEmpty(conditions) ? {} : conditions)
      .skip(+skip)
      .limit(+limit)
			.sort({ "createdAt": -1 })
      .populate({
        path: 'authorId',
        select: ['username', 'firstName', 'lastName', 'avatarUrl'],
        model: User,
      })
			.exec();
	},

  /**
	 * Total count of requested post
   * @param {String} search - Search term
	 * @returns {Promise<Review[]>}
	 */
  getCount({ search, filter = {} } = {}) {
    let conditions,
        userCondition,
        statusCondition,
        searchCondition,
        stateCondition;

    if (filter.uid) {
      userCondition = {
        "authorId": filter.uid
      };
    }

    if (filter.status) {
      statusCondition = {
        "status": filter.status
      }
    }

    if (filter.state) {
      stateCondition = {
        "state": filter.state,
      };
    }

    const escapedString = _.escapeRegExp(search);

    if (escapedString) {
      searchCondition = {
        "$or": [
          {
            "title": {
              $regex: escapedString,
      				$options: 'i'
            }
          },
          {
            "summary": {
              $regex: escapedString,
      				$options: 'i'
            }
          },
          {
            "content": {
              $regex: escapedString,
      				$options: 'i'
            }
          }
        ]
      }
    }

    if (userCondition || searchCondition || statusCondition || stateCondition) {
      conditions = {
        "$and": [
          _.isEmpty(searchCondition) ? {} : searchCondition,
          _.isEmpty(userCondition) ? {} : userCondition,
          _.isEmpty(statusCondition)? {} : statusCondition,
          _.isEmpty(stateCondition)? {} : stateCondition,
        ]
      }
    }

		return this.count(_.isEmpty(conditions) ? {} : conditions).exec();
  },

  /**
   * Get post by id
   * @param {ObjectId} id - Review id
   * @return {Promise<Review>}
   */
  getById(id) {
    return this.findById(id)
      .populate({
        path: 'authorId',
        select: ['username', 'firstName', 'lastName', 'avatarUrl'],
        model: User,
      })
      .exec();
  },

};

export default mongoose.model('Post', PostSchema);
