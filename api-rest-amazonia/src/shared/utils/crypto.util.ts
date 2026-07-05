import * as bcrypt from 'bcrypt';

// OWASP recomends cost factor >= 12 to resist brute-force attacks
const SALT_ROUNDS = 12;

export const hashPassword = async (plainPassword: string): Promise<string> => {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};


export const comparePassword = async (
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};
