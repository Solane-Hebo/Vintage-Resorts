import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
    const authHeader = 
    req.headers.authorization || req.headers.Authorization
    
    
    try {

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Not authenticated. No token provided.' 
            })
        }
    
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)


        req.user = decoded.userInfo

        
        next()
        
    } catch (error) {
        return res.status(401).json({ 
            message: 'Not Authenticated. Invalid token.' 
        })
        
    }
}

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    
    if(!req.user || !req.user.role) {
        return res.status(403).json({
            message: `Access denied. You do not have access to this resource.`
        })
    }
   

        if(!allowedRoles.includes(req.user.role)) {
             return res.status(403).json({
                message: `Required roles: ${allowedRoles.join(', ')}`
            })
        }

        next()

    }
