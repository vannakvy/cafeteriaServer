import { AuthenticationError } from 'apollo-server-errors'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config.js'

const checkAuth = (context) => {
    const authHeader = context.req.headers.authorization;
    // console.log(authHeader)
    if(authHeader){
        // Bearer ...
        const token = authHeader.split('Bearer ')[1];
        if(token){
            try{
                const user = jwt.verify(token, CONFIG.SECRET_KEY)
                return user;
            } catch (err) {
                throw new AuthenticationError('Invalid/Expired token')
            }
        }
        throw new Error('Authentication token must be \'Bearer [token]')
    }
    throw new Error('Authentication header must be provided')
}

export default checkAuth