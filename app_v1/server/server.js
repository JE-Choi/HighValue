const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
var parser = bodyParser.json();
app.use(parser);
app.use(bodyParser.urlencoded({ extended : true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
});
connection.connect();

app.post('/api/createAccount', (req, res) => {
    let sql = `INSERT INTO account_list VALUES (?,?,?,?,?);`;
    
    let account_id = req.body.account_id;
    let account_num = req.body.account_num;
    let account_pw = req.body.account_pw;
    let person_id = req.body.person_id;
    let study_id = req.body.study_id;

    let params = [account_id, account_num, account_pw, person_id,study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.get('/api/studyItems', (req, res) => {

    connection.query(
        "SELECT * FROM studyitem",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디에 가입한 현재 인원수
app.post('/api/studyItems/current_people', (req, res) => {
    let sql = `SELECT * FROM study_join WHERE study_id = ?`;

    let id = req.body.index;

    let params = [id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디에 가입한 현재 인원수
app.post('/api/studyItems/view_currentPeople', (req, res) => {
    let sql = `SELECT * FROM study_join WHERE study_id = ?`;

    let id = req.body.study_id;

    let params = [id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 사용자가 고객 추가 데이터 전송했을 때 처리하는 부분.
app.post('/api/studyItems', parser, (req, res) => {
    let sql = `INSERT INTO studyitem VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`;
    let study_name = req.body.study_name;
    let study_type = req.body.study_type;
    let num_people = req.body.num_people;
    let study_start_date = req.body.study_start_date;
    let study_end_date = req.body.study_end_date;
    let study_coin = req.body.study_coin;
    let study_desc = req.body.study_desc;

    let params = [study_name, study_type, num_people, study_start_date, study_end_date, study_coin, study_desc];
    connection.query(sql, params, 
        (err, rows, fields) => {
            // 성공적 데이터 입력->클라이언트에게 출력
            res.send(rows); 
        }
    );
});

// RenameStudy, stydy_info에서 사용
app.get('/api/studyItems/view/:id', (req, res) => {
    let sql = `SELECT * FROM studyitem where s_id  = ?`;
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 방장 불러오는 부분
app.get('/api/studyItems/view_leader/:id', (req, res) => {
    let sql = `SELECT person_name FROM person_info WHERE person_id = (SELECT person_id from study_join where study_join.leader = 1 AND study_join.study_id = ?)`;
    
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.post('/api/studyItems/view/rename/', (req, res) => {
    let sql = `UPDATE studyitem SET study_name = ?, study_type = ?, num_people = ?, start_date = ?, end_date = ?, study_coin = ?, study_desc = ? WHERE s_id  = ?`;
   
    let study_name = req.body.study_name;
    let study_type = req.body.study_type;
    let num_people = req.body.num_people;
    let study_start_date = req.body.study_start_date;
    let study_end_date = req.body.study_end_date;
    let study_coin = req.body.study_coin;
    let study_desc = req.body.study_desc;
    let id = req.body.rename_index;

    let params = [study_name, study_type, num_people, study_start_date, study_end_date, study_coin, study_desc, id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.delete('/api/studyItems/:id', (req, res) => {
    let sql = 'DELETE FROM studyitem WHERE s_id = ?';
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

// 회원가입 중복확인 부분
app.post('/api/signup_overlap', (req, res) => {
    let sql = "SELECT * FROM person_info WHERE PERSON_ID = ?";
 
    let person_id = req.body.person_id;

    let params = [person_id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// STUDY 가입자
app.post('/api/studyItems/join/:id', (req, res) => {
    let sql = `INSERT INTO study_join VALUES (?, ?, ?)`;

    let study_id = req.params.id;
    let person_id = req.body.person_id;
    let leader = req.body.leader;
    // let account_number = req.body.account_number;

    // let params = [study_id, person_id, leader, account_number];
    let params = [study_id, person_id, leader];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// STUDY 생성자
app.post('/api/studyItems/leader', (req, res) => {
    let sql = `INSERT INTO study_join VALUES (?, ?, ?)`;

    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    let leader = req.body.leader;
    // let account_number = req.body.account_number;

    // let params = [study_id, person_id, leader, account_number];
    let params = [study_id, person_id, leader];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 회원가입 데이터 삽입
app.post('/api/signup', parser, (req, res) => {
    let sql =`INSERT INTO person_info VALUES (?,?,?);`;
    let personId  = req.body.personId;
    let personPw = req.body.personPw;
    let personName = req.body.personName;

    let params = [personId,personPw,personName];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 로그인 판별
app.post('/api/login', (req, res) => {
    let sql = "SELECT * FROM person_info WHERE PERSON_ID = ?";

    let userId = req.body.userId;

    let params = [userId];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 로그인한 사용자
app.post('/api/login/user_name', (req, res) => {
    let sql = "SELECT person_name FROM person_info WHERE PERSON_ID = ?";

    let person_id = req.body.person_id;

    let params = [person_id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 로그인 한 사용자는 스터디에 가입한 사람인지 판별
// 로그인 한 사용자는 해당 스터디의 리더인지 판별
app.post('/api/isCheckJoinAndLeader',(req,res)=>{
    let sql = `SELECT * FROM study_join WHERE PERSON_ID = ? AND STUDY_ID = ?`;

    let person_id = req.body.person_id;
    let study_id = req.body.study_id;

    let params = [person_id,study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// myPage에서 해당 사용자가 가입한 스터디 불러오기
app.post('/api/myPage/joinStudy', (req, res) => {
    let sql = `SELECT * from studyitem WHERE s_id in (SELECT study_id FROM study_join WHERE person_id = ?)`;
    let person_id = req.body.person_id;
    
    let params = [person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// myPage에서 선택한 스터디에서의 자신의 코인 조회
app.post('/api/coinManagement/loadAccount', (req, res) => {
    let sql = `SELECT account_id FROM account_list WHERE study_id = ? AND person_id = ?;`;
    
    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    
    let params = [study_id,person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
