import mysql from "mysql2/promise";

export const wpPool = mysql.createPool({
  uri: process.env.WP_DATABASE_URL,
  connectionLimit: 5,
});
    