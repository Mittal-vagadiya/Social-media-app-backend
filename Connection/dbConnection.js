import mysql from 'mysql';

const {CONNECTION_HOST,CONNECTION_USERNAME,CONNECTION_PASSWORD,CONNECTION_DATABASE} = process.env;

export const connection = mysql.createConnection({
  host: CONNECTION_HOST,
  user: CONNECTION_USERNAME,
  password:CONNECTION_PASSWORD,
  database:CONNECTION_DATABASE
});
