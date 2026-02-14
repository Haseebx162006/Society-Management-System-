import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import token_generate from '../util/token';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({
                msg: "Invalid name"
            });
        }

        

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                msg: "Invalid email"
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                msg: "Invalid password"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                msg: "Password must be at least 6 characters long"
            });
        }

        const userFind = await User.findOne({ email });

        if (userFind) {
            return res.status(400).json({
                msg: "User already exists with this email check another one"
            });
        }

        const user = await User.create({ name: name, email: email, password: password });

        return res.status(201).json({
            msg: "User is created"
        });

    } catch (error) {
        return res.status(500).json({
            msg: "Error in the first try catch block of signup"
        });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+$/;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                msg: "Invalid email"
            });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                msg: "Invalid email"
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                msg: "Invalid password"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                msg: "Password must be at least 6 characters long"
            });
        }

        const finduser = await User.findOne({ email });

        if (!finduser) {
            return res.status(404).json({
                msg: "User does not exist. Signup first and then login"
            });
        }
        if (!await finduser.matchpassword(password)) {
            return res.status(400).json({
                msg: "Invalid password"
            });
        }
        const token = token_generate(finduser._id.toString());
        if (!token) {
            return res.status(500).json({
                msg: "Error in generating the token"
            });
        }

        return res.status(200).json({
            msg: "User logged in successfully",
            token: token
        });

    } catch (error) {
        return res.status(500).json({
            msg: "Error in the try catch block of login"
        });
    }
}
