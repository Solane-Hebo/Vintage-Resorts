import jwt from 'jsonwebtoken'


export function generateToken(user) {
    return jwt.sign({
        userInfo: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}