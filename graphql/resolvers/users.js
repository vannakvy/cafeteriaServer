import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserInputError } from 'apollo-server'

import { validateRegisterInput, validateLoginInput } from '../../util/validators.js'
import { CONFIG } from '../../config.js'
import User from '../../models/User.js'

import { loginExpireDate } from '../../functions/fn.js'

function generateToken(user){
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        CONFIG.SECRET_KEY,
        { expiresIn: loginExpireDate() }
    )
}

const users = {
    Mutation: {
        async login(_, {username, password}){
            const {errors, valid} = validateLoginInput(username, password)

            if(!valid){
                throw new UserInputError('Error', {errors})
            }
            
            const user = await User.findOne({ username })

            if(!user) {
                errors.general = "User not found"
                throw new UserInputError("Wrong credentials", {errors})
            }

            const match = await bcrypt.compare(password, user.password)
            if(!match){
                errors.general = "User not found"
                throw new UserInputError("Wrong credentials", {errors})
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(
            _,
            {
                registerInput: { username, email, password, confirmPassword }
            },
            context,
            info
        ) {
            // TODO Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)

            if(!valid){
                throw new UserInputError("Errors", {errors})
            }
            // TODO make sure user doesn't already exist

            const user = await User.findOne({ username });

            if(user){
                throw new UserInputError("Username is taken", {
                    errors: {
                        username: "This username is taken"
                    }
                })
            }

            // TODO hash password and create an auth token
            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            })

            const res = await newUser.save()

            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}

export default users