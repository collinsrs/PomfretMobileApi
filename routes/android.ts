import Express from 'express';
import androidService from '../services/android/androidService';

const androidRouter = Express.Router();

androidRouter.route("/download/:id").get(async (request, res, next) => {
    const referrer: string | any = request.headers.referer;
    //verify token
    const userId = request.params.id;
    if (!userId) {
        return res.status(400).json({
            status: 400,
            isError: true,
            error: "No user ID was provided with this request."
        });
    } 
    if (!referrer) {
        return res.status(400).json({
            status: 400,
            isError: true,
            error: "No callback URL was provided with this request. Please provide a referring URL and try again."
        });
    }
    androidService(userId, request, res, next);

});

export default androidRouter;