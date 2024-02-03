import path from 'path';
import fs from 'fs';

const staticDirectory = '/home/ubuntu/code/server/static/';

export default (req, res) => {
	const targetDirectory = path.join(staticDirectory, 'allImages');
	const albumsDirectory = path.join(targetDirectory, 'albums');
	const tagsDirectory = path.join(targetDirectory, 'tags');
	const activityTagsDirectory = path.join(targetDirectory, 'activity_tags');

	if (
		fs.existsSync(albumsDirectory) &&
		fs.lstatSync(albumsDirectory).isDirectory()
	) {
		const albums = {};
		fs.readdirSync(albumsDirectory).forEach((person) => {
			const personPath = path.join(albumsDirectory, person);
			if (fs.lstatSync(personPath).isDirectory()) {
				const personObject = { index: '', urls: [] };
				fs.readdirSync(personPath).forEach((category) => {
					const categoryPath = path.join(personPath, category);
					if (fs.lstatSync(categoryPath).isDirectory()) {
						fs.readdirSync(categoryPath).forEach((image) => {
							if (image.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp)$/)) {
								const imagePath = `https://facei.top/statics/allImages/albums/${person}/${category}/${image}`;
								if (category === 'index') {
									personObject.index = imagePath;
								} else if (category === 'urls') {
									personObject.urls.push(imagePath);
								}
							}
						});
					}
				});
				albums[person] = personObject;
			}
		});
		const tagsImage = getImagePaths(
			tagsDirectory,
			'https://facei.top/statics/allImages/tags'
		);
		const activityTagsImage = getImagePaths(
			activityTagsDirectory,
			'https://facei.top/statics/allImages/activity_tags'
		);

		return { data: { albums, tagsImage, activityTagsImage } };
	} else {
		return { error: 'Albums directory not found.' };
	}
};

function getImagePaths(directory, baseUrl) {
	const imagesByTag = {};
	fs.readdirSync(directory).forEach((tag) => {
		const tagPath = path.join(directory, tag);
		if (fs.lstatSync(tagPath).isDirectory()) {
			const tagImages = fs
				.readdirSync(tagPath)
				.filter((image) =>
					image.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp)$/)
				)
				.map((image) => `${baseUrl}/${tag}/${image}`);

			imagesByTag[tag] = tagImages;
		}
	});
	return imagesByTag;
}
