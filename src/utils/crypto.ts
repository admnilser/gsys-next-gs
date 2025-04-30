"use server";

import { type JWTPayload, SignJWT, jwtVerify } from "jose";

import bcrypt from "bcryptjs";

const secretKey = process.env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: JWTPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		});
		return payload;
	} catch (error) {
		console.error("decrypt failed", error);
	}
}

export async function hashPassword(plain: string) {
	const hashed = await bcrypt.hash(plain, 10);
	return hashed;
}

export async function checkPassword(plain: string, hashed: string) {
	const isMatch = await bcrypt.compare(plain, hashed);
	return isMatch;
}
