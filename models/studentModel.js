const connection = require("../comman/dbConnection");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db_table = require("../comman/dbManipulation");
const set_jwt = require("../utils/jwt");
const jwtexpirationtime = require("../comman/config");
const jwt = require("jsonwebtoken");
const config = require("../comman/config");
const fs = require("fs");
const { application } = require("express");
const fsPromises = require("fs").promises;

module.exports.SignUp = async function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let userGet = `SELECT * FROM ${db_table.user} WHERE email_address =? `;
    var result = await connection.executeQuery(userGet, [
      req.body.email_address,
    ]);
    if (result.length > 0) {
      return res.status(409).send({
        msg: "This email is already in use!",
      });
    } else {
      var hash = await bcrypt.hash(req.body.password, 10);
      let sql = `INSERT INTO ${db_table.user} SET ? `;
      var userdata = {
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        mobile_no: req.body.mobile_no,
        email_address: req.body.email_address,
        password: hash,
        status: "active",
      };
      let signupdata = await connection.executeQuery(sql, userdata);

      if (signupdata.insertId > 0) {
        res.status(200).send({
          data: "The user has been registerd with us!",
        });
      } else {
        res.status(400).send({
          msg: "something went wrong",
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      msg: error,
    });
  }
};

module.exports.Login = async (req, res) => {
  try {
    user_find_query = `SELECT user_id,first_name,last_name,password FROM  ${db_table.user} WHERE email_address=?`;
    var userdata = await connection.executeQuery(user_find_query, [
      req.body.email_address,
    ]);
    if (!userdata.length) {
      res.status(401).send({
        msg: "username or password is incorrect!",
      });
    } else {
      var bResult = await bcrypt.compare(
        req.body.password,
        userdata[0]["password"]
      );
      if (bResult == true) {
        var result = await set_jwt.set_jwt_auth(userdata, res);

        if (result) {
          res.status(200).send({
            data: result,
          });
        } else {
          res.status(400).send({
            msg: "bad request",
          });
        }
      } else {
        res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      msg: error,
    });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    let all_users = `SELECT user_id,first_name,last_name FROM  ${db_table.user}`;
    var userdata = await connection.executeQuery(all_users);
    if (userdata.length > 0) {
      res.status(200).send({
        data: userdata,
      });
    } else {
      res.status(200).send({
        msg: "",
      });
    }
  } catch (error) {
    res.status(400).send({
      msg: error,
    });
  }
};

module.exports.refreshAccessToken = function (req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      jwt.verify(refreshToken, process.env.API_KEY, function (err, user) {
        if (!err) {
          req.userId = user.id;
          console.log(user);
          const token = jwt.sign({ id: user.id }, process.env.API_KEY, {
            expiresIn: jwtexpirationtime.jwtAccessExpiration,
          });
          res.cookie("accessToken", token, { httpOnly: true });
          res.status(200).send({ message: "user refresh authenticate" });
        } else {
          console.log(err);
          res.status(401).send({ message: "Token Expired" });
        }
      });
    } else {
      res.status(401).send({ message: "Token Expired" });
    }
  } catch (error) {
    res.status(400).send({
      msg: error,
    });
  }
};

module.exports.submit_student_doc = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(409).json({ errors: errors.array() });
    }
    let dir_name = `./public/documents/${req.body.student_id}`;
    if (!fs.existsSync(dir_name)) {
      fs.mkdirSync(dir_name);
    }
    let file_name = `profile.jpg`;
    let file_path = `${dir_name}/${file_name}`;
    let saved_file = await store_file(file_path, req.body.file);
    if (saved_file.status) {
      let check_document_exixst = await is_document_exists(req.body.student_id);
      if (check_document_exixst.length == 0) {
        const submit_student_doc_data = {
          student_id: req.body.student_id,
          doc_name: file_name,
          document_comment: req.body.document_comment,
        };
        const insert_astudent_doc_sql = `INSERT INTO ${db_table.student_doc} SET ? `;
        const submit_student_doc_result = await connection.executeQuery(
          insert_astudent_doc_sql,
          submit_student_doc_data
        );
        if (submit_student_doc_result.insertId > 0) {
          res.status(200).json({
            data: "doc save successfully",
            student_doc_id: submit_student_doc_result.insertId,
          });
        } else {
          res.status(400).json({
            msg: "something went wrong",
          });
        }
      } else {
        const update_student_doc_data = [
          file_name,
          req.body.document_comment,
          req.body.student_id,
        ];
        const update_student_doc_sql = `UPDATE ${db_table.student_doc} SET doc_name = ?, document_comment = ? WHERE student_id = ?`;
        const update_student_doc_result = await connection.executeQuery(
          update_student_doc_sql,
          update_student_doc_data
        );
        if (update_student_doc_result.affectedRows > 0) {
          res.status(200).json({
            data: "doc save successfully",
            student_doc_id: update_student_doc_result.affectedRows,
          });
        } else {
          res.status(400).json({
            msg: "something went wrong",
          });
        }
      }
    } else {
      res.status(400).json({
        msg: saved_file.message,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: error,
    });
  }
};

module.exports.get_student_document = async (req, res, next) => {
  try {
    var student_id = req.body.student_id;
    var document = req.body.document;
    const sql = `SELECT * FROM ${db_table.student_doc} WHERE student_id = ?`;
    const result = await connection.executeQuery(sql, [student_id]);
    if (result.length != 0) {
      if (fs.existsSync(`./public/documents/${student_id}/${document}.jpg`)) {
        let file_path = `${req.protocol}://${req.headers.host}/documents/${student_id}/${document}.jpg`;
        let data = {
          file_path: file_path,
        };
        var sql1 = `SELECT doc_id,student_id,document_comment FROM ${db_table.student_doc} WHERE student_id = ?`;
        var result1 = await connection.executeQuery(sql1, [student_id]);
        console.log(result1);
        result1.forEach((element) => {
          element["doc_file"] = data.file_path;
        });
        res.status(200).json(result1);
      } else {
        res.status(400).json({
          msg: "File not found",
        });
      }
    } else {
      res.status(400).json({
        msg: "student not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: error,
    });
  }
};

module.exports.delete_student_doc = async (req, res) => {
  try {
    var doc_id = req.body.doc_id;
    if (doc_id) {
      let student_doc_sql = `DELETE FROM ${db_table.student_doc} WHERE doc_id=?`
      let student_delete_doc = await connection.executeQuery(student_doc_sql,[doc_id])
      if(student_delete_doc.affectedRows > 0){
        res.status(200).json({
          data:'student doc delete successfully'
        })
      }else{
        res.status(400).json({
          msg:'bad request'
        })
      }

    }else{
      res.status(409).json({ msg:"doc_id id not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: error,
    });
  }
};

module.exports.send_student_data = async (req, res, next) => {
  try {
    var finalObj = [];
    var student_data_sql = `SELECT user_id,first_name,last_name,email_address FROM ${db_table.user}`;
    var student_data_result = await connection.executeQuery(student_data_sql);
    var student_attendence_sql = `SELECT * FROM ${db_table.student_attendence}`;
    var student_attendence_result = await connection.executeQuery(student_attendence_sql);

    student_data_result.forEach(function (application, i) {
      application["student_information"] = [
        {
          student_id: application.user_id,
          student_name: application.first_name.concat(
            " ",
            application.last_name
          ),
          student_email: application.email_address,
        },
      ];
      application["student_attendence"] = student_attendence_result;
      json_field(application)
      finalObj.push(application);
    });

    res.status(200).json({
      data: finalObj,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: error,
    });
  }
};

store_file = async (file_path, data) => {
  try {
    await fsPromises.writeFile(file_path, data, {
      encoding: "base64",
      flag: "w",
      mode: 0o666,
    });
    return {
      status: true,
      message: "Document saved successfully",
    };
  } catch (err) {
    return {
      status: false,
      message: "Unable to save document, please try again",
    };
  }
};

is_document_exists = async (student_id) => {
  const document_exists_sql = `SELECT doc_id FROM ${db_table.student_doc} WHERE student_id = ?`;
  const document_exists_res = await connection.executeQuery(
    document_exists_sql,
    [student_id]
  );
  return document_exists_res;
};

json_field=async(application)=>{
  delete application['user_id'];
  delete application['first_name'];
  delete application['last_name'];
  delete application['email_address'];
}