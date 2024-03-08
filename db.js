import pg from 'pg';
const pool = new pg.Pool(); //seharusnya disini ada koneksi database, tapi karena rahasia perlu ditaruh di .env

export default pool; // ini nanti diganti namanya di app.js menjadi db