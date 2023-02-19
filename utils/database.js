const bcrypt = require('bcrypt');
const mysql = require('mysql2'); 
require('dotenv').config();

const pool = mysql.createPool({
    host: `${process.env.MYSQL_HOST}`,
    user: `${process.env.MYSQL_USER}`,
    password: `${process.env.MYSQL_PWORD}`,
    database: `${process.env.MYSQL_DB}`
}).promise();

const emailExists = async function(email) {
    const emailQuery = await pool.execute("SELECT * from user WHERE email = ?", [email])
    console.log(emailQuery[0]);
    if (emailQuery[0].length == 1) {
        //console.log(typeof(emailQuery[0][0].email));
        return Promise.resolve(true)
    }
    else {
        return Promise.resolve(false); 
    }
}
const addAccount = async function(email, password) {
    const [insertQuery] = await pool.execute("INSERT INTO user (email, password) VALUES (?, ?)", [email, password])
    if (insertQuery.insertId) {
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

const verifyLogin = async function(email, rawPassword) {

    const emailQuery = await pool.execute("SELECT * from user WHERE email = ?", [email])
    if (emailQuery[0].length == 1) { 
        const passwordMatch = await bcrypt.compare(rawPassword, emailQuery[0][0].password)
        console.log(passwordMatch)
        return Promise.resolve(passwordMatch)
    }
    else {
        return Promise.resolve(false); 
    }
}
//verifyLogin('gezell@ucsd.edu', '123').then(verified => {console.log(verified)})
async function test() {

    const pwdTest = 'omg'
    const pwdTestHashed = await bcrypt.hash(pwdTest, 13);
    const match = await bcrypt.compare(pwdTest, pwdTestHashed); 
    console.log(match)
}
//test();
module.exports.emailExists = emailExists
module.exports.addAccount = addAccount
module.exports.verifyLogin = verifyLogin