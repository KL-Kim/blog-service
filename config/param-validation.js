/**
 * Parameters Validation Config
 * @export {Object}
 * @version 0.0.1
 */
import Joi from 'joi';

export default {

  // Get posts list
  "getList": {
    "query": {
      skip: Joi.number(),
      limit: Joi.number(),
      search: Joi.string().trim().strip().allow(''),
      uid: Joi.string().hex(),
    }
  },

  // Get single post
  "getSinglePost": {
    "params": {
      id: Joi.string().hex().required(),
    }
  },

  // Add new post
  "addNewPost": {
    "body": {
      authorId: Joi.string().hex().required(),
      title: Joi.string().trim().strip().required(),
      summary: Joi.string().trim().strip().allow(''),
      content: Joi.string().trim().strip().required(),
      keywords: Joi.array().items(Joi.string().trim()),
      status: Joi.string().valid(['DRAFT', 'PUBLISHED', 'TRASH']).allow(''),
    },
  },

  // Update post
  "updatePost": {
    "params": {
      id: Joi.string().hex().required(),
    },
    "body": {
      authorId: Joi.string().hex().required(),
      title: Joi.string().trim().strip(),
      summary: Joi.string().trim().strip(),
      content: Joi.string().trim().strip(),
      keywords: Joi.array().items(Joi.string().trim()),
      status: Joi.string().valid(['DRAFT', 'PUBLISHED', 'TRASH']),
    },
  },

  // Delete post
  "deletePost": {
    "params": {
      id: Joi.string().hex().required(),
    },
    "body": {
      authorId: Joi.string().hex().required(),
    },
  },

  // Vote post
  "votePost": {
    "params": {
      id: Joi.string().hex().required(),
    },
    "body": {
      uid: Joi.string().hex().required(),
      vote: Joi.string().valid(['UPVOTE', 'DOWNVOTE']),
    },
  },

  // Report post
  "reportPost": {
    "params": {
      id: Joi.string().hex().required(),
    },
    "body": {
      type: Joi.string().trim().strip(),
      content: Joi.string().trim().strip(),
      contact: Joi.string().trim().strip().allow(''),
    },
  },

  // Get posts list by admin
  "getPostsListByAdmin": {
    "query": {
      skip: Joi.number(),
      limit: Joi.number(),
      search: Joi.string().trim().strip().allow(''),
      status: Joi.string().valid(['DRAFT', 'PUBLISHED', 'TRASH']),
      uid: Joi.string().hex(),
    }
  },

  // Update post state by admin
  "updatePostByAdmin": {
    "params": {
      id: Joi.string().hex().required(),
    },
    "body": {
      state: Joi.string().valid(['NORMAL', 'SUSPENDED']),
    },
  }
};
