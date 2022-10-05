import prisma from "../../lib/prisma";
import { GoogleAuth, JWT } from "google-auth-library";
import jsonwebtoken from "jsonwebtoken";
import {Request, Response, NextFunction} from 'express';


export default async function androidService(id: string, req: Request, res: Response, next: NextFunction) {

    if (!id) {
        return res.status(400).json({
            status: 400,
            isError: true,
            error: "No user ID was provided with this request."
        });
    }
    const data = await prisma.user.findUnique({
        where: {
            id: id
        }
    });

    if (!data) {
        return res.status(400).json({
            status: 400,
            isError: true,
            error: "No user ID was provided with this request."
        });
    }
    
const keyFilePath = __dirname + "/gkey.json";

const issuerId = process.env.GPAY_ISSUER_ID;
const classId = 'v2-android';
let userId = '';
const credentials = require(keyFilePath);
let objectId = `${issuerId}.${userId.replace(/[^\w.-]/g, '_')}-${classId}`;
const httpClient = new GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
});

const objectUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/';
const objectPayload = {
  "id": objectId,
  "classId": `${issuerId}.${classId}`,
  "textModulesData": [
    {
      "header": "Name",
      "body": data?.name
    },
    {
        "header": "School",
        "body": data?.schoolName
    },
    {
        "header": "Student ID",
        "body": data?.internalId
    }
  ],
  "barcode": {
    "kind": "walletobjects#barcode",
    "type": "qrCode",
    "value": data?.internalId
  },
  "state": "active",
  "accountId": data?.id,
  "accountName": data?.name,
};
let objectResponse;

try {
  objectResponse = await httpClient.request({
    url: objectUrl + objectId,
    method: 'GET'
  });
} catch (err: any) {
  if (err.response && err.response.status === 404) {
    // Object does not yet exist
    // Send POST request to create it
    objectResponse = await httpClient.request({
      url: objectUrl,
      method: 'POST',
      data: objectPayload
    });
  } else {
    objectResponse = err;
  }
}

//console.log('object GET or POST response:', objectResponse);

const claims = {
    iss: credentials.client_email,
    aud: 'google',
    origins: ['www.example.com'],
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [{
        id: objectId
      }],
    }
  };
  
  const token = jsonwebtoken.sign(claims, credentials.private_key, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
  
  res.json({
    saveUrl
      });
}
