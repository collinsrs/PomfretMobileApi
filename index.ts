import api from "./lib/express";
import auth from "./services/auth";
import {iosRouter} from "./routes/ios";
import androidRouter from "./routes/android";
import { uptimeRouter } from "./routes/ping";
import dotenv from 'dotenv';

dotenv.config();

api.listen(9999, () => {
    console.log("Server started on port 9999");
    });


//Uncomment below to enable session-based authentication, along with client secret verification.
//api.use(auth);


api.use("/v2/ios", iosRouter);
api.use("/v2/android", androidRouter);
api.use("/v2/ping", uptimeRouter);

