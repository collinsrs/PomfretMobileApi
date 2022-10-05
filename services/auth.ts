import {Request, Response, NextFunction} from 'express';
import prisma from '../lib/prisma';

const clientSecretFromServer = process.env.AUTHORIZED_CLIENT_SECRET;

export default async function auth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    const clientSecret = req.headers.x_cle_cdf;

    if (!token && clientSecret === clientSecretFromServer) {
        return res.status(401).json({
            status: 401,
            isError: true,
            error: 'No method of authentication was provided with this request.'
        });
    } else if (clientSecret !== clientSecretFromServer) {
        return res.status(401).json({
            status: 401,
            isError: true,
            error: 'The client secret provided with this request is invalid.'
        });
    }  else if (!clientSecret) {
            return res.status(401).json({
                status: 401,
                isError: true,
                error: 'No client secret was provided with this request.'
            })
        }
    const session = await prisma.session.findFirst({
        where: {
            sessionToken: token
        }
    });
    if (!session) {
        return res.status(403).json({
            status: 403,
            isError: true,
            error: 'The provided token is either invalid or has expired.'
        });
    }
    next();
}