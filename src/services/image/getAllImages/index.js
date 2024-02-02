import path from 'path';

const staticDirectory = '/home/ubuntu/code/ai-flask/static/';

export default (req, res) => {
	const targetDirectory = path.join(staticDirectory, 'allImages');
	const albumsDirectory = path.join(targetDirectory, 'albums');

	if (
		fs.existsSync(albumsDirectory) &&
		fs.statSync(albumsDirectory).isDirectory()
	) {
		try {
			const albums = {};
			fs.readdirSync(albumsDirectory).forEach((person) => {
				const personPath = path.join(albumsDirectory, person);

				if (fs.statSync(personPath).isDirectory()) {
					const personDict = { index: '', urls: [] };
					fs.readdirSync(personPath).forEach((category) => {
						const categoryPath = path.join(personPath, category);

						if (fs.statSync(categoryPath).isDirectory()) {
							fs.readdirSync(categoryPath).forEach((image) => {
								if (image.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp)$/)) {
									const imagePath = path.join(
										'https://facei.top/static/allImages/albums',
										person,
										category,
										image
									);
									if (category === 'index') {
										personDict.index = imagePath;
									} else if (category === 'urls') {
										personDict.urls.push(imagePath);
									}
								}
							});
						}
					});
					albums[person] = personDict;
				}
			});
			res.json(albums);
		} catch (error) {
			console.error(error);
			res.status(500).send('Internal Server Error');
		}
	} else {
		res.status(404).send('Not Found');
	}
};
