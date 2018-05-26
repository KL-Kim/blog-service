import Promise from 'bluebird';
import mongoose, { Schema } from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';

import APIError from '../helper/api-error';

const BlogSchema = new Schema({
  "priority": {
    type: Number,
    default: 0,
    min: 0,
    max: 9,
  },
  "status": {
    type: String,
    enum: ['Draft', 'Published', 'Trash'],
    default: 'Draft',
  },
  "authorId": {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  "keyword": [{
    type: String
  }],
  "upVote": [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  "commentsList": [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  "updatedAt": {
    type: Date,
    default: Date.now,
  },
  "createdAt": {
    type: Date,
		default: Date.now
  },
});

/**
 * Indexes
 */
BlogSchema.index({
  "priority": 1,
  "title": "text",
});

/**
 * Virtuals
 */
BlogSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
BlogSchema.methods = {
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
BlogSchema.statics = {
  /**
	 * List blogs in descending order of 'createdAt' timestamp.
   * @param {String} search - Search term
	 * @returns {Promise<Blog[]>}
	 */
	getList({ skip = 0, limit = 10, search, filter = {}, orderBy } = {}) {
    let order;

    switch (orderBy) {
      case "new":
        order = {
          "createdAt": -1
        };
        break;

      default:
        order = {
          "quality": 'desc',
          "createdAt": -1
        };
    }

		return this.find()
      .skip(skip)
      .limit(limit)
			.sort(order)
			.exec();
	},

  /**
	 * Total count of requested blog
   * @param {String} search - Search term
	 * @returns {Promise<Review[]>}
	 */
  getCount({ search, filter = {} } = {}) {
		return this.count().exec();
  },

  /**
   * Get blog by id
   * @param {ObjectId} id - Review id
   * @return {Promise<Review>}
   */
  getById(id) {
    return this.findById(id)
      .exec();
  },

};

export default mongoose.model('Blog', BlogSchema);
