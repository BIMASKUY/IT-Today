import express from "express";
import db from "./db.js";
import "dotenv/config";
import multer from "multer";
import fs from 'fs'

//dari storage sampai upload berisi mekanisme simpen file
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/img");
    },
    filename: function (req, file, cb){
        const fileName = Date.now() + '_' + file.originalname;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT; //ambil variabel PORT dari file .env

app.set("view engine", "ejs"); //menggunakan EJS
app.use(express.urlencoded( {extended : true } )); //agar dapat "post" data pada form
app.use(express.static("public")); //agar dapat mengakses image dan css di folder "public"

//untuk db perlu async & await
app.get("/", async (req, res) => {
    const query = await db.query("SELECT * FROM datadiri");
    //res.send(query.rows); //kenapa rows? karena query memiliki object rows 
    const result = query.rows;
    res.render("home", {result});
});

app.get("/add", (req, res) => {
    res.render("add");
});

app.post("/add", upload.single("namaFile"), async (req, res) => {
    //"namaFile" harus sama dengan "name" yang berada di add.ejs
    const name = req.body.nama;
    const age = req.body.usia;
    const fileName = req.file.filename; //ambil nama filenya ajah, karena req.file punya banyak objek
    await db.query("INSERT INTO datadiri(nama, usia, url_foto) VALUES ($1, $2, $3)", [name, age, fileName]);
    res.redirect("/");
});

app.get("/delete/:nama", async (req, res) => {
    const nama = req.params.nama;
    const query = await db.query("SELECT url_foto FROM datadiri WHERE nama = $1", [nama]); //tetap perlu diproses "targetFile" karena hasil query masih raw
    const targetFile = query.rows[0].url_foto;

    await db.query("DELETE FROM datadiri WHERE nama = $1", [nama]);

    if(targetFile !== null) fs.unlinkSync(`./public/img/${targetFile}`);
    
    res.redirect("/");
});

app.get("/detail/:nama", async (req, res) => {
    const nama = req.params.nama;
    const query = await db.query("SELECT * FROM datadiri WHERE nama = $1", [nama]);
    const result = query.rows;
    
    res.render("detail", {result});
});

app.listen(port, () => {
    console.log(`Server Is Listening In Port ${port}`);
});