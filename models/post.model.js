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
  },
  "createdAt": {
    type: Date,
		default: Date.now
  },
});

/**
 * Indexes
 */
PostSchema.index({
  "priority": 1,
  "title": "text",
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
        searchCondition;

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

    if (userCondition || searchCondition || statusCondition) {
      conditions = {
        "$and": [
          _.isEmpty(searchCondition) ? {} : searchCondition,
          _.isEmpty(userCondition) ? {} : userCondition,
          _.isEmpty(statusCondition)? {} : statusCondition,
        ]
      }
    }

		return this.find(_.isEmpty(conditions) ? {} : conditions)
      .skip(+skip)
      .limit(+limit)
			.sort({ "createdAt": -1 })
      .populate({
        path: 'authorId',
        select: ['username', 'firstName', 'lastName', 'profilePhotoUri'],
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
        searchCondition;

    if (filter.uid) {
      userCondition = {
        "authorId": filter.uid
      };
    }

    if (filter.status) {
      console.log(filter.status);
      statusCondition = {
        "status": filter.status
      }
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

    if (userCondition || searchCondition || statusCondition) {
      conditions = {
        "$and": [
          _.isEmpty(searchCondition) ? {} : searchCondition,
          _.isEmpty(userCondition) ? {} : userCondition,
          _.isEmpty(statusCondition)? {} : statusCondition,
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
        select: ['username', 'firstName', 'lastName', 'profilePhotoUri'],
        model: User,
      })
      .exec();
  },

};

export default mongoose.model('Post', PostSchema);
