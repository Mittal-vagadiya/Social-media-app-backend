import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment";
import multer from "multer";
import path from 'path';

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

export function updateData(data) {
  return data.map((item) => {
    delete item.password;
    item.profileImage = item.profileImage ? `/uploads/${item.profileImage}` : null;
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

export function formatDate(inputdate) {
  let timestamp;

  if (inputdate) {
    timestamp = inputdate;
  } else {
    timestamp = new Date();
  }
  return moment(timestamp).format("YYYY-MM-DD hh:mm:ss");
}

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    let removeSpace = file.originalname.replace(/\s/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + removeSpace)
  }
})

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext != '.jfif') {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 15,
  },
});