import prisma from '../../../db/prisma.js';

export default async (req, res) => {
	const user = await prisma.user.findUnique({
		where: {
			userId: req.body.userId,
		},
	});
	if (!user) {
		return { data: null };
	} else {
		return { data: user };
	}
};
