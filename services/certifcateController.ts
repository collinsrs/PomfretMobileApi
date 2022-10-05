import { promises as fs } from "fs";
import path from "path";

const certificatesCache: Partial<{
	signerCert: Buffer| any;
	signerKey: Buffer | any;
	wwdr: Buffer | any;
	signerKeyPassphrase: string| any;
}> = {};


const sessionCache: Partial<{
	userName: String| any;
	userId: String | any;
	sessToken: String | any;
	userGradYear: string| any;
}> = {};

export async function getCertificates(): Promise<typeof certificatesCache> {
	if (Object.keys(certificatesCache).length) {
		return certificatesCache;
	}

	const [signerCert, signerKey, wwdr, signerKeyPassphrase] =
		await Promise.all([
			fs.readFile(
				path.resolve(__dirname, "../certificates/signerCert.pem"),
				"utf-8",
			),
			fs.readFile(
				path.resolve(__dirname, "../certificates/signerKey.pem"),
				"utf-8",
			),
			fs.readFile(
				path.resolve(__dirname, "../certificates/WWDR.pem"),
				"utf-8",
			),
			Promise.resolve("nonstop2021"),
		]);

	Object.assign(certificatesCache, {
		signerCert,
		signerKey,
		wwdr,
		signerKeyPassphrase,
	});

	return certificatesCache;
}
