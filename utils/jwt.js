const jwt = require('jsonwebtoken');
const jwtexpirationtime = require('../comman/config')
require('dotenv').config()

module.exports={
set_jwt_auth:async function(userdata,res) {
    try{
        
        if(userdata.length > 0){
          const token = jwt.sign({ user_id: userdata[0].user_id }, process.env.API_KEY, { expiresIn: jwtexpirationtime.jwtAccessExpiration });
          const refreshToken = jwt.sign({  }, process.env.API_KEY, { })
 
          res.cookie("accessToken", token, { httpOnly: true })
          //Refresh Token
          res.cookie("refreshToken", refreshToken, { httpOnly: true });

          var result = { user_id: userdata[0].user_id,first_name:userdata[0].first_name,last_name:userdata[0].last_name};

          return await result;
        }else{
          res.status(400).send({
            msg:'Bad request'
          })
        }

        }catch(error){
       res.status(400).send({
           msg:'bad request'
       })
    }  
  }
 }