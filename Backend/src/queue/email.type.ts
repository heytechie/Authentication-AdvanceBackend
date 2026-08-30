
export enum EmailJobType {
    VERIFY_EMAIL = "VERIFY-EMAIL",
    PASSWORD_RESET = "PASSWORD-RESET"
}
export type verifyEmailJobType = {
    type:EmailJobType
    name:string,
    email:string,
    verificationToken:string
}
