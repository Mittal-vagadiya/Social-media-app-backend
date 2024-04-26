import { CreateResponse } from "./helper.js";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const jwtVerifier = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json(CreateResponse("Token is missing."));
  }

  jwt.verify(token, JWT_SECRET, function (err, decoded) {
    if (err) {
      return res
        .status(403)
        .json(
          CreateResponse("You are not Authenticated. Please Login to continue.")
        );
    }
    req.user = decoded.data;
  });
  next();
};
