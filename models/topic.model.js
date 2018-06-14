import Promise from 'bluebird';
import mongoose, { Schema } from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';

import config from '../config/config';
import APIError from '../helper/api-error';

const TopicSchema = new Schema({
  "code": {
    "type": Number,
    "required": true,
    "unique": true,
  },
  "enName": {
    "type": String,
    "required": true,
    "unique": true,
    "lowercase": true,
  },
  "cnName": {
    "type": String,
    "required": true,
    "unique": true,
  },
  "krName": {
    "type": String,
    "required": true,
    "unique": true,
  },
});

/**
 * Index
 */
TopicSchema.index({
  "code": 1,
  "enName": 'text',
  "cnName": 'text',
  "krName": 'text',
});

/**
 * Virtuals
 */
TopicSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
TopicSchema.methods = {
  /**
	 * Remove unnecessary info
	 */
  toJSON() {
		let obj = this.toObject();
		delete obj.__v;
		delete obj.createdAt;
		return obj;
	},
};

/**
 * Statics
 */
TopicSchema.statics = {

  /**
	 *  List topics in descending order of 'code'.
	 * @returns {Promise<Tag[]>}
	 */
	getList(search) {
    let searchCondition = {};

    const escapedString = _.escapeRegExp(search);

    searchCondition = {
      $or: [
        {
          "krName": {
            $regex: escapedString,
						$options: 'i'
          }
        },
        {
          "cnName": {
            $regex: escapedString,
						$options: 'i'
          }
        },
        {
          "enName": {
            $regex: escapedString,
						$options: 'i'
          }
        },
      ]
    }

		return this.find(searchCondition)
			.sort({ "code": 1 })
			.exec();
	},

  /**
   * Get topic by id
   * @param {Object} id - tag id
   * @return {Promise<Tag>}
   */
  getById(id) {
    return this.findById(id).exec();
  },

  /**
   * Get topic by code
   * @param {Number} code - tag code
   * @return {Promise<Tag>}
   */
  getByCode(code) {
    return this.findOne({"code": code}).exec();
  },
};

export default mongoose.model('Topic', TopicSchema);
