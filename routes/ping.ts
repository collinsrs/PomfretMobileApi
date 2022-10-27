import Express from "express";

export const uptimeRouter = Express.Router();

uptimeRouter.route("/").get(async (request, res, next) => {
    const authorizationKey = process.env.PING_AUTHORIZATION;

    if (request.headers.authorization !== authorizationKey) {
        return res.status(401).json({
            status: 401,
            isError: true,
            error: "Unauthorized"
        });
    }
    res.status(200).json({ message: "ok" });
});

