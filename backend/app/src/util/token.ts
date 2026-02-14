import jwt from 'jsonwebtoken';

const token_generate = (id: string): string | undefined => {
    try {
        if (!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not defined in environment variables");
        }
        return jwt.sign({ id }, process.env.PRIVATE_KEY, {
            expiresIn: "7d"
        });
    } catch (error) {
        console.error("Error in the creation of token", error);
        return undefined;
    }
}

export default token_generate;
