import prisma from '../lib/prisma';
import type {Slug, Method, Remote, Status, User} from '../types/request.types';


export default async function requestHandler(slug: Slug, method: Method, remote: Remote, status: Status, user: User) {
    const data = await prisma.request.create({
        data: {
            slug: slug,
            requestMethod: method,
            remoteUser: remote,
            statusCode: status,
            userId: user,
            userAgent: '@PomfretMobile-APIRuntime/2.0.0'
        }
    });
    if (data) {
        return true;
    } else {
        return false;
    }
}