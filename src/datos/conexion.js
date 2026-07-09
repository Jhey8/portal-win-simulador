import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const configuracion = {
  host: process.env.BD_HOST || 'localhost',
  port: Number(process.env.BD_PUERTO) || 3306,
  user: process.env.BD_USUARIO || 'root',
  password: process.env.BD_CONTRASENA || '',
  database: process.env.BD_NOMBRE || 'portal_win',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

if (process.env.BD_SSL === 'true') {
  configuracion.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(configuracion);

export const consultar = async (sql, parametros = []) => {
  const [filas] = await pool.execute(sql, parametros);
  return filas;
};

export default pool;
