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
    try {
        const emailQuery = await pool.execute("SELECT * from user WHERE email = ?", [email]);
        if (emailQuery[0].length == 1) {
            return Promise.resolve(true)
        }
        else {
            return Promise.resolve(false); 
        }
    }
    catch(err) {
        return Promise.resolve(null); 
    }
}

const idExists = async function(id) {
    try {
        const idQuery = await pool.execute("SELECT * from user WHERE uID = ?", [id])
        if (idQuery[0].length == 1) {
            return Promise.resolve(true)
        }
        else {
            return Promise.resolve(false); 
        }
    }
    catch(err) {
        return Promise.resolve(null); 
    }
}
const addAccount = async function(email, password) {
    try {
        const [insertQuery] = await pool.execute("INSERT INTO user (email, password) VALUES (?, ?)", [email, password])
        if (insertQuery.insertId) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
    catch(err) {
        return Promise.resolve(null); 
    }

}

const verifyLogin = async function(email, rawPassword) {

    try {
        const emailQuery = await pool.execute("SELECT * from user WHERE email = ?", [email])
        if (emailQuery[0].length == 1) { 
            const passwordMatch = await bcrypt.compare(rawPassword, emailQuery[0][0].password)
            return Promise.resolve(emailQuery[0][0].uID);
        }
        else {
            return Promise.resolve(null); 
        }
    }
    catch(err) {
        return Promise.resolve(null); 
    }
}

const grabUserInfo = async function(uID) {

    try {
        const query = await pool.execute("SELECT email, phone_number FROM user WHERE uID = ?", [uID])
        if (query[0].length == 1) { 
            const userObject = {email: query[0][0].email, phone_number: query[0][0].phone_number};
            return Promise.resolve(userObject);
        }
        else {
            return Promise.resolve(null); 
        }
    }
    catch (err) {
        return Promise.resolve(null);
    }
}

const grabUserMonitored = async function(uID) {
    const queryString = `SELECT m.startggUser_ID, s.playerTag
    FROM monitored m, startggUser s
    WHERE m.user_ID = ? AND m.startggUser_ID=s.sggID`;
    try {
        const query = await pool.execute(queryString, [uID])
        monitoredList = []
        for (x in query[0]) {
            monitoredList.push(query[0][x].playerTag);
        }

        
        return Promise.resolve(monitoredList);
    }
    catch (err) {
        return Promise.resolve(null);
    }
}
const addMonitored = async function(uID, sggID) {
    const query = `INSERT INTO monitored (user_ID, startggUser_ID) VALUES(?, ?)`;
    
    try {
        const [result, metadata] = await pool.execute(query, [uID, sggID]);
        return Promise.resolve(true);
      } 
    catch (error) {
        return Promise.resolve(false);
    }
}
const removeMonitored = async function(uID, sggID) {
    const query = `DELETE FROM monitored WHERE user_ID=? AND startggUser_ID=?`;
    
    try {
        const [result, metadata] = await pool.execute(query, [uID, sggID]);
        return Promise.resolve(true);
      } 
    catch (error) {
        return Promise.resolve(false);
    }
}

module.exports.emailExists = emailExists
module.exports.idExists = idExists
module.exports.grabUserInfo = grabUserInfo
module.exports.grabUserMonitored = grabUserMonitored
module.exports.addMonitored = addMonitored
module.exports.removeMonitored = removeMonitored
module.exports.addAccount = addAccount
module.exports.verifyLogin = verifyLogin