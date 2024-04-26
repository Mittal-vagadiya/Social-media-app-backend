import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const { JWT_SECRET, SALT } = process.env;

export function CreateResponse(error, data, message) {
  if (error) {
    return { isSuccess: false, error: error };
  }
  if (data) {
    return { isSuccess: true, data, message };
  } else {
    return { isSuccess: true, message };
  }
}

export function removeField(data) {
  return data.map((item) => {
    delete item.password;
    return item;
  });
}

export function genrateToken(data) {
  const payload = {
    userId: data[0].userId,
    email: data[0].email,
  };
  return jwt.sign(
    {
      data: payload,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function genrateHashPassword(password) {
  return bcrypt.hashSync(password, parseInt(SALT));
}