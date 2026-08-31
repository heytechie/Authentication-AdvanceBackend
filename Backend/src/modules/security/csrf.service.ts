import crypto from 'crypto';
import type {Response} from 'express';
import {env} from '../../config/env.config.js'

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const CSRF_TOKEN_LENGTH = 32; 

export const generateCSRFToken = (): string => {
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export const setCSRFTokenCookie = (res: Response): string => {
    const token = generateCSRFToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: env.NODE_ENV === 'prod',
        sameSite: 'lax',
        path: '/',
    });

    return token;
}


export const clearCSRFTokenCookie = (res: Response): void => {
    res.clearCookie(CSRF_COOKIE_NAME, {
        httpOnly: false,
        secure: env.NODE_ENV === 'prod',
        sameSite: 'lax',
        path: '/',
    })
}