require('../config/db.config');

import Post from '../models/post.model';

Post.remove({}, function(err) {
	if (err) throw err;

	console.log("Removed mongo database documents");
});

let post, i;

for (i = 0; i < 100; i++) {
	post = new Post({
		authorId: "5b5eb06fb497fb0efad11a06",
		title: 'Title ' + i,
		content: "Content " + i,
		summary: "Summary " + i,
		status: "PUBLISHED",
	});

	post.save().then((item) => {
		console.log(item.title + ' has been Added');
	});
}
