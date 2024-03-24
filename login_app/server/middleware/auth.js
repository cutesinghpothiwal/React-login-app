import jwt, { decode } from "jsonwebtoken";
import ENV from '../config.js';

export default async function auth(req, res, next) {
    try {
        // Access the authorization header to validate the request
        const token = req.headers.authorization.split(" ")[1]; 

        // Retrieve the user details
        const decodeToken = await jwt.verify(token, ENV.JWT_SECRET);
        
        // Attach the decoded user information to the request object
        
        req.user = decodeToken;
        
        // Call the next middleware in the chain
        next()
    } catch (error) {
        res.status(401).json({ error: "Authentication Failed" });
    }
}


export function localVariables(req, res ,next){
    req.app.locals = {
        OTP : null , 
        resetSession : false
    }
    next()
}