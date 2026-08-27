export interface GoogleUserProfile{
    providerAccountId:string;
    email:string;
    name?:string;
    picture?:string;
    email_verified:boolean;
}