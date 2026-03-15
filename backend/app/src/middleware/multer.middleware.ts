import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { Request, Response, NextFunction } from 'express';
import { validateFileUpload } from "../util/fileValidation";

// Vercel serverless only allows writes to /tmp
const tempDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'uploads')
    : path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        cb(null, uniqueName);
    }
});

const ALLOWED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', 
    '.pdf', '.xlsx', '.doc', '.docx', '.csv'
];

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type or extension not allowed`));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

/**
 * Middleware wrapper for file upload with server-side validation
 * Validates file magic bytes to prevent spoofed file types
 */
export const uploadWithValidation = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const singleUpload = upload.single(fieldName);

        singleUpload(req as any, res, (err: any) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }

            if (!req.file) {
                // No file uploaded, that's fine, continue
                return next();
            }

            // Validate file magic bytes (server-side security check)
            const validation = validateFileUpload(
                req.file.path,
                req.file.originalname,
                req.file.mimetype,
                5 * 1024 * 1024
            );

            if (!validation.valid) {
                // Delete the uploaded file immediately
                try {
                    fs.unlinkSync(req.file.path);
                } catch (e) {
                    console.error('Error deleting invalid file:', e);
                }
                return res.status(400).json({ success: false, message: validation.error });
            }

            // File is valid, continue
            next();
        });
    };
};
