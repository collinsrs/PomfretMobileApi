import prisma from '../lib/prisma';

export default async function userQuery(id: string) {
    const data = await prisma.user.findUnique({
        where: {
            id: id
        }
    });
    if (data) {
        return data;
    } else {
        return false;
    }
}
