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

    const encodeName: string | any = userData?.internalId;
    const encodeAccountID: string | any = userData?.id;
    const encodeAccountRole: string | any = userData?.Role;
    const encodeUserEmail: string | any = userData?.email;
    const encodeUserInternal: string | any = userData?.internalId;
    const encodeUserSchool: string | any = userData?.schoolName;

    requestHandler('/v2/ios/download', 'GET', request.ip, 200, userId);
     const certificates = await getCertificates();
     
     try {
         const pass = await PKPass.from(
             {
                 model: path.resolve(__dirname, "../models/lightPass"),
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
             relevantText: "Tap scan and pay with PomfretCard."
         });
 
 
         pass.backFields.push(
             {
                 key: "type",
                 label: "Pass Type",
                 value: "Student- Light",
 
             },
             {
                 key: "id-innerva",
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
                 value: "2.0",
             },
         );
         
         const stream = pass.getAsStream();
         try {
             res.set({
                 "Content-type": pass.mimeType,
                 "Content-disposition": `attachment; filename=${passName}.pkpass`,
             });
     
             stream.pipe(res);
             res.redirect(referrer);
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




