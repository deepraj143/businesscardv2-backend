const e = require('express');
const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next) =>{
    try{
        if(req.cookies !== undefined && req.cookies.token !== undefined && req.cookies.token !== null)
        {
            try{
                const result = jwt.verify(req.cookies.token,process.env.ACCESS_TOKEN_SECRET);
                res.locals.user_id = result.user_id;
                next();
            }
            catch(err){
                if(err.name === 'TokenExpiredError')
                {
                    res.status(401).json({status:"Login Expired",message:[]})
                }
                else{
                    res.status(401).json({status:"Access Denied catch error",message:[]})
                }
            }
        }
        else{
            res.status(401).json({status:"Access Denied else error",message:[]})
        }
    }
    catch(err){
        res.status(500).json({status:"Access Denied outer catch",message:[]})
    }
}

module.exports = verifyToken;