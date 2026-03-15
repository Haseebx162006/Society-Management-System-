import fs from 'fs';
import path from 'path';

/**
 * File magic bytes (signatures) for validation
 * Prevents uploading malicious files with spoofed extensions
 */
const MAGIC_BYTES: Record<string, string[]> = {
    // Images
    'image/jpeg': ['FFD8FF'],
    'image/png': ['89504E47'],
    'image/gif': ['474946'],
    'image/webp': ['52494646', '57454250'],
    
    // Documents
    'application/pdf': ['25504446'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['504B0304'],  // xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504B0304'],  // docx
    'application/msword': ['D0CF11E0', 'FEFF', 'FFFE'],  // doc
    
    // CSV
    'text/csv': [],  // No specific magic bytes, check extension only
};

/**
 * Extract first N bytes from file buffer and convert to hex
 */
const getFileSignature = (buffer: Buffer, bytes: number = 4): string => {
    return buffer.subarray(0, bytes).toString('hex').toUpperCase();
};

/**
 * Server-side file validation using magic bytes
 * @param filePath - Path to the uploaded file
 * @param expectedMimeType - Expected MIME type from client
 * @returns true if valid, false otherwise
 */
export const validateFileMagicBytes = (filePath: string, expectedMimeType: string): boolean => {
    try {
        // Read first 10 bytes to check magic bytes
        const buffer = Buffer.alloc(10);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer);
        fs.closeSync(fd);

        const signature = getFileSignature(buffer, 4);

        // Get expected magic bytes for this MIME type
        const expectedBytes = MAGIC_BYTES[expectedMimeType];

        if (!expectedBytes || expectedBytes.length === 0) {
            // For types without magic bytes (like CSV), just check extension
            return true;
        }

        // Check if file signature matches any expected signature
        return expectedBytes.some(byte => signature.startsWith(byte));
    } catch (error) {
        console.error('Error validating file magic bytes:', error);
        return false;
    }
};

/**
 * Comprehensive file validation
 * Checks MIME type, extension, magic bytes, and size
 */
export const validateFileUpload = (
    filePath: string,
    originalFileName: string,
    mimeType: string,
    maxSizeBytes: number = 5 * 1024 * 1024
): {
    valid: boolean;
    error?: string;
} => {
    try {
        // 1. Check MIME type is in allowed list
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

        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            return {
                valid: false,
                error: `MIME type ${mimeType} not allowed`,
            };
        }

        // 2. Check file extension
        const ext = path.extname(originalFileName).toLowerCase();
        const ALLOWED_EXTENSIONS = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp',
            '.pdf', '.xlsx', '.xls', '.doc', '.docx', '.csv'
        ];

        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return {
                valid: false,
                error: `File extension ${ext} not allowed`,
            };
        }

        // 3. Check file size
        const stats = fs.statSync(filePath);
        if (stats.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit`,
            };
        }

        // 4. Check file size minimum (prevent empty files)
        if (stats.size < 100) {
            return {
                valid: false,
                error: 'File is too small or empty',
            };
        }

        // 5. Validate magic bytes (most important!)
        if (!validateFileMagicBytes(filePath, mimeType)) {
            return {
                valid: false,
                error: `File content does not match ${mimeType} format. Possible file type mismatch or corruption.`,
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: `File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
};

/**
 * Validate file size doesn't exceed quota
 */
export const checkUserDiskQuota = async (
    userId: string,
    newFileSizeBytes: number,
    maxQuotaBytes: number = 100 * 1024 * 1024 // 100MB default
): Promise<{ allowed: boolean; message?: string }> => {
    try {
        // TODO: Implement actual quota checking against database
        // For now, just check against the limit
        if (newFileSizeBytes > maxQuotaBytes) {
            return {
                allowed: false,
                message: `File size exceeds user quota of ${maxQuotaBytes / 1024 / 1024}MB`,
            };
        }
        return { allowed: true };
    } catch (error) {
        return {
            allowed: false,
            message: 'Error checking disk quota',
        };
    }
};
