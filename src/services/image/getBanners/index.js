import prisma from '../../../db/prisma.js';

export default async () => {
	const data = await prisma.imageIndex.findMany({
		where: {
			category: 'banner',
		},
	});
	return { code: 'success', data };
};
