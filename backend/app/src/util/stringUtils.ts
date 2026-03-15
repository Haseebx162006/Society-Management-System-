/**
 * Utility functions for safe string operations
 * Prevents ReDoS and injection attacks
 */

/**
 * Escapes special regex characters to prevent ReDoS attacks
 * @param str - The string to escape
 * @returns Escaped string safe for use in regex patterns
 */
export const escapeRegex = (str: string): string => {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Safely creates a case-insensitive MongoDB regex query
 * Protected against ReDoS attacks
 * @param searchTerm - User input search term
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Safe regex pattern
 */
export const createSafeRegex = (searchTerm: string, maxLength: number = 100): RegExp => {
    if (!searchTerm || typeof searchTerm !== 'string') {
        return new RegExp('');
    }

    // Enforce max length immediately
    const truncated = searchTerm.substring(0, maxLength);
    
    // Escape special regex characters
    const escaped = escapeRegex(truncated);
    
    // Create case-insensitive regex
    return new RegExp(escaped, 'i');
};

/**
 * Validates and sanitizes user input strings
 * @param input - User input
 * @param maxLength - Maximum allowed length
 * @param fieldName - Field name for error messages
 * @returns Sanitized string
 * @throws Error if validation fails
 */
export const validateString = (
    input: any,
    maxLength: number,
    fieldName: string = 'input'
): string => {
    if (typeof input !== 'string') {
        throw new Error(`${fieldName} must be a string`);
    }

    const trimmed = input.trim();

    if (trimmed.length === 0) {
        throw new Error(`${fieldName} cannot be empty`);
    }

    if (trimmed.length > maxLength) {
        throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
    }

    return trimmed;
};

/**
 * Validates MongoDB ObjectId
 * @param id - ID to validate
 * @returns true if valid ObjectId
 */
export const isValidObjectId = (id: any): boolean => {
    if (typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Safely converts and validates numeric input
 * @param value - Value to convert
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Field name for error messages
 * @returns Validated number
 * @throws Error if validation fails
 */
export const validateNumber = (
    value: any,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER,
    fieldName: string = 'value'
): number => {
    const num = parseInt(value, 10);

    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }

    if (num < min || num > max) {
        throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }

    return num;
};

/**
 * Strips sensitive data from user objects for API responses
 * @param user - User document
 * @returns Sanitized user object
 */
export const maskUserData = (user: any): any => {
    if (!user) return null;

    const { password, locked_until, failed_login_attempts, ...safeUser } = user;

    return {
        id: safeUser._id,
        name: safeUser.name,
        email: safeUser.email,
        is_super_admin: safeUser.is_super_admin,
        status: safeUser.status,
        email_verified: safeUser.email_verified,
    };
};

/**
 * Strips sensitive fields from array of users
 * @param users - Array of user documents
 * @returns Array of sanitized users
 */
export const maskUsersData = (users: any[]): any[] => {
    if (!Array.isArray(users)) return [];
    return users.map(maskUserData);
};
