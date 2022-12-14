import Express from "express";
import { PKPass } from "passkit-generator";
import { getCertificates } from "../services/certifcateController";
import prisma from "../lib/prisma";
import path from "path";
import requestHandler from "../services/requestHandler";


export const iosRouter = Express.Router();

iosRouter.route("/download/:id").get(async (request, res, next) => {
    const referrer: string | any = request.headers.referer;
    const tz = Intl.DateTimeFormat().resolvedOptions();
    const userTheme = request.query.theme;
    let selectedTheme: string | undefined;
    const lightThemePath: string = '../models/lightPass';
    const darkThemePath: string = '../models/darkPass';
    const bluePath: string = '../models/bluePass';
    const griffinThemePath: string = '../models/griffinPass';
    const purpleThemePath: string = '../models/purplePass';

    if (userTheme) {
        if (userTheme === 'light') {
            selectedTheme = lightThemePath;
        } else if (userTheme === 'dark') {
            selectedTheme = darkThemePath;
        } else if (userTheme === 'griffin') {
            selectedTheme = griffinThemePath;
        } else if (userTheme === 'blue') {
            selectedTheme = bluePath;
        } else if (userTheme === 'purple') {
            selectedTheme = purpleThemePath;
        } else {
            selectedTheme = lightThemePath;
        }
    } else {
        return res.status(400).json({ message: 'No theme was provided with this request' });
    }
    
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
     const passName = userId;

     const userData = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    const encodeName: string | any = userData?.name;
    const encodeAccountID: string | any = userData?.id;
    const encodeAccountRole: string | any = userData?.Role;
    const encodeUserEmail: string | any = userData?.email;
    const encodeUserInternal: string | any = userData?.internalId;
    const encodeUserSchool: string | any = userData?.schoolName || 'Pomfret School';

    requestHandler('/v2/ios/download', 'GET', request.ip, 200, userId);
     const certificates = await getCertificates();
     
     try {
         const pass = await PKPass.from(
             {
                 model: path.resolve(__dirname, selectedTheme),
                 certificates: {
                     wwdr: certificates.wwdr,
                     signerCert: certificates.signerCert,
                     signerKey: certificates.signerKey,
                     signerKeyPassphrase: certificates.signerKeyPassphrase,
                 },
             },
             request.body || request.params || request.query,
         );
 
         
 
         pass.headerFields.push(
             {
                 key: "id",
                 label: "ID",
                 value: encodeUserInternal,
             },
         );
 
         pass.primaryFields.push(
             {
                 key: "lac-name",
                 label: "Name",
                 value: encodeName,
             }
         );
 
         pass.setBarcodes({
             message: encodeUserInternal,
             format: "PKBarcodeFormatPDF417",
         });
 
         pass.setBeacons({
             proximityUUID: "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
             relevantText: "Tap to scan and pay using PomfretCard."
         });
 
 
         pass.backFields.push(
             {
                 key: "id-digital",
                 label: "Digital Account ID:",
                 value: encodeAccountID,
 
             },
             {
                key: "email",
                label: "E-Mail Address:",
                value: encodeUserEmail,

            },
            {
                key: "type",
                label: "Account Type:",
                value: encodeAccountRole,

            },
             {
                    key: "school-name", 
                    label: "School:",
                    value: encodeUserSchool,
             },
             {
                 key: "School-id",
                 label: "School Account ID:",
                 value: encodeUserInternal,
             },
             {
                 key: "timestamp",
                 label: "Pass Creation:",
                 value: new Date().toLocaleString("en-US", {timeZone: tz.timeZone}), 
             },
             {
                 key: "expstamp",
                 label: "Pass Expiration:",
                 value: "None",
             },
             {
                 key: "gen-version",
                 label: "Version",
                 value: "2.0.2",
             },
             {
                key: "pass-issuer",
                label: "Issuer",
                value: "@core/ios/v2.0.2",
             },
         );
         
         const stream = pass.getAsStream();
         try {
             res.set({
                 "Content-type": pass.mimeType,
                 "Content-disposition": `attachment; filename=${passName}.pkpass`,
             });
     
             stream.pipe(res);
         } catch (err) {
             console.log(err);
     
             res.set({
                 "Content-type": "text/html",
             });
     
             res.send(err);
            }
        } catch (err) {
            console.log(err);
            res.set({
                "Content-type": "text/html",
            });
    
            res.send(err);
        }
 });




