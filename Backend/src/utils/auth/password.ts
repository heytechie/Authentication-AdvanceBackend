import bycrypt from "bcrypt";
import {env} from "../../config/env.config.js";

export const hashPassword = async(password:string):Promise<string> => {
    const saltRounds = env.BYCRYPT_SALT_ROUNDS;
    const hashedPassword = await bycrypt.hash(password, saltRounds);
    return hashedPassword;
}

export const comparePassword = async(password:string,hashedPassword:string):Promise<boolean> => {
    const isMatch = await bycrypt.compare(password, hashedPassword);
    return isMatch;
}