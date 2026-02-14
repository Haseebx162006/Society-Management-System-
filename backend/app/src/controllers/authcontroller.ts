import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import token_generate from '../util/token';
import { sendResponse, sendError } from '../util/response';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string") {
            return sendError(res, 400, "Invalid name");
        }

        if (!email || typeof email !== "string") {
            return sendError(res, 400, "Invalid email");
        }

        if (!password || typeof password !== "string") {
            return sendError(res, 400, "Invalid password");
        }
        if (password.length < 6) {
            return sendError(res, 400, "Password must be at least 6 characters long");
        }

        const userFind = await User.findOne({ email });

        if (userFind) {
            return sendError(res, 400, "User already exists with this email check another one");
        }

        const user = await User.create({ name: name, email: email, password: password });

        return sendResponse(res, 201, "User is created", user);

    } catch (error: any) {
        return sendError(res, 500, "Error in signup", error);
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+$/;

        if (!email || typeof email !== "string") {
            return sendError(res, 400, "Invalid email");
        }
        if (!emailRegex.test(email)) {
             return sendError(res, 400, "Invalid email format");
        }

        if (!password || typeof password !== "string") {
             return sendError(res, 400, "Invalid password");
        }
        if (password.length < 6) {
             return sendError(res, 400, "Password must be at least 6 characters long");
        }

        const finduser = await User.findOne({ email });

        if (!finduser) {
             return sendError(res, 404, "User does not exist. Signup first and then login");
        }
        if (!await finduser.matchpassword(password)) {
             return sendError(res, 400, "Invalid password");
        }
        const token = token_generate(finduser._id.toString());
        if (!token) {
             return sendError(res, 500, "Error in generating the token");
        }

        return sendResponse(res, 200, "User logged in successfully", { token });

    } catch (error: any) {
        return sendError(res, 500, "Error in login", error);
    }
}
