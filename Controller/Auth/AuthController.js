import { connection } from "../../Connection/dbConnection.js";
import {
  CreateResponse,
  genrateHashPassword,
  genrateToken,
  removeField,
} from "../../helper.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const LoginController = async (req, res) => {
  const { email, password } = req.body;
  const findUserQuery = "select * from user where email = ?";
  await connection.query(findUserQuery, [email], async (err, data) => {
    if (err) {
      res.status(400).json(CreateResponse(err));
    }
    if (data.length == 0) {
      res
        .status(400)
        .json(CreateResponse("User does not exist.Please Regiser to continue"));
    } else {
      const dbPassword = data[0].password;
      const match = await bcrypt.compare(password, dbPassword);
      if (!match) {
        res.status(400).json(CreateResponse("Password does not match"));
      } else {
        data[0].token = genrateToken(data);
        res
          .status(200)
          .json(
            CreateResponse(
              null,
              removeField(data)[0],
              "User Login Successfullly"
            )
          );
      }
    }
  });
};

export const RegisterController = async (req, res) => {
  const { userName, email, password } = req.body;
  const findUserQuery = "select * from user where email = ?";
  await connection.query(findUserQuery, [email], async (err, data) => {
    if (err) {
      res.status(400).json(CreateResponse(err));
    }
    if (data.length > 0) {
      res
        .status(400)
        .json(CreateResponse("User does exist.Please Login to continue"));
    } else {
      const id = uuidv4();
      const hashedPassword = genrateHashPassword(password);
      const inserQuery =
        "insert into user (userId,email,password,userName) values (?,?,?,?)";

      await connection.query(
        inserQuery,
        [id, email, hashedPassword, userName],
        (err, data) => {
          if (err) {
            res.status(400).json(CreateResponse(err));
          }
          res
            .status(200)
            .json(
              CreateResponse(
                null,
                null,
                "User Registerd Successfullly.Please login to continue"
              )
            );
        }
      );
    }
  });
};

export const ResetPasswordController = async (req, res) => {
    const { email, newPassword } = req.body;
    const findUserQuery = "select * from user where email = ?";
    await connection.query(findUserQuery, [email], async (err, data) => {
      if (err) {
        res.status(400).json(CreateResponse(err));
      }
      if (data.length = 0) {
        res
          .status(400)
          .json(CreateResponse("User does not exist.Please Register to continue"));
      } else {

        const dbPassword = genrateHashPassword(newPassword);
        const updatePasswordQuery = 'UPDATE user SET password = ? WHERE email = ?';
        await connection.query(updatePasswordQuery, [dbPassword,email], async (err, data) => {
            if (err) {
              res.status(400).json(CreateResponse(err));
            }

            res
              .status(200)
              .json(
                CreateResponse(
                  null,
                  "Password reset successfully.Please Login to continue"
                )
              );

        })
      }
    });
  };  