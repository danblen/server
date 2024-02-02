import prisma from '../../../db/prisma.js';

const imageUrls = [
	'https://facei.top/static/allImages/banner/photo_112@05-11-2022_05-24-49.jpg',
	'https://facei.top/static/allImages/banner/photo_109@05-11-2022_05-24-49.jpg',
	'https://facei.top/static/allImages/banner/photo_108@05-11-2022_05-24-49.jpg',
	'https://facei.top/static/allImages/banner/photo_111@05-11-2022_05-24-49.jpg',
];
export default async () => {
	const data = await prisma.imageIndex.findMany();
	return { code: 'success', data };
};
