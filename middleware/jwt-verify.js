
require('dotenv').config()
const jwt = require("jsonwebtoken");
const config = require("../comman/config");
const userauthorization = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (token) {
       try {
        const data = jwt.verify(token,process.env.API_KEY);
        req.userId = data.id;
        next();
      } catch(err) {
        res.status(403).send({
         msg:err
        })
      }
    }else{ res.status(400).send({
      msg:"Bad Request"
    })
    }
  };
  module.exports=userauthorization;
