import { connection } from "../../Connection/dbConnection.js";
import {
  CreateResponse,
  genrateHashPassword,
  genrateToken,
  updateData,
} from "../../helper.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const LoginController = (req, res) => {
  const { email, password } = req.body;
  const findUserQuery = "SELECT * from user WHERE email = ?";
  try {
    connection.query(findUserQuery, [email], async (err, data) => {
      if (err) return res.status(500).json(CreateResponse(err));
      if (data.length == 0) return res.status(502).json(CreateResponse("User does not exist.Please Regiser to continue"));

      const checkPassword = await bcrypt.compare(password, data[0].password);
      if (!checkPassword) return res.status(400).json(CreateResponse("Wrong Password!"));
      data[0].token = genrateToken(data);
      return res
        .status(200)
        .json(
          CreateResponse(
            null,
            updateData(data)[0],
            "User Login Successfullly"
          )
        );
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};

export const RegisterController = (req, res) => {
  const { userName, email, password } = req.body;
  const findUserQuery = "SELECT * FROM user WHERE email = ?";
  const inserQuery =
    "INSERT INTO user (userId,email,password,userName) VALUES (?,?,?,?)";

  try {
    connection.query(findUserQuery, [email], (err, data) => {
      if (err) return res.status(400).json(CreateResponse(err));
      if (data.length > 0) return res.status(409).json(CreateResponse("User does exist.Please Login to continue"));

      const id = uuidv4();
      const hashedPassword = genrateHashPassword(password);
      return connection.query(
        inserQuery,
        [id, email, hashedPassword, userName],
        (err, data) => {
          if (err) return res.status(400).json(CreateResponse(err));

          res
            .status(200)
            .json(
              CreateResponse(
                null, null,
                "User Registerd Successfullly.Please login to continue"
              )
            );
        }
      );
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};

export const ResetPasswordController = (req, res) => {
  const { email, newPassword } = req.body;
  const findUserQuery = "SELECT * FROM user WHERE email = ?";
  const updatePasswordQuery = "UPDATE user SET password = ? WHERE email = ?";

  try {
    connection.query(findUserQuery, [email], async (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      }

      if (data.length === 0) {
        return res
          .status(400)
          .json(
            CreateResponse("User does not exist.Please Register to continue")
          );
      } else {
        const dbPassword = await genrateHashPassword(newPassword);
        connection.query(
          updatePasswordQuery,
          [dbPassword, email],
          (err, data) => {
            if (err) {
              return res.status(400).json(CreateResponse(err));
            }
            return res
              .status(200)
              .json(
                CreateResponse(
                  null, null,
                  "Password reset successfully.Please Login to continue"
                )
              );
          }
        );
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};