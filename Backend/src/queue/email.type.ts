

export type verifyEmailJobType = {
    type:"VERIFY-EMAIL",
    name:string,
    email:string,
    verificationToken:string
}