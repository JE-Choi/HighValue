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

// 계좌 생성
app.post('/api/createAccount', (req, res) => {
    let sql = `INSERT INTO account_list VALUES (?,?,?,?,?);`;
    
    let account_index = req.body.account_index;
    let account_num = req.body.account_num;
    let account_pw = req.body.account_pw;
    let person_id = req.body.person_id;
    let study_id = req.body.study_id;

    let params = [account_index, account_num, account_pw, person_id,study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디 목록들 요소 불러오기
app.get('/api/studyItems', (req, res) => {

    connection.query(
        "SELECT * FROM studyitem",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디에 가입한 현재 사람 정보
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

// 스터디에 가입한 현재 사람 정보
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

// 사용자가 고객 추가 데이터 전송했을 때 처리
app.post('/api/studyItems', parser, (req, res) => {
    let sql = `INSERT INTO studyitem VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 0)`;
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

// 방장 불러오기
app.get('/api/studyItems/view_leader/:id', (req, res) => {
    let sql = `SELECT person_name FROM person_info WHERE person_id = (SELECT person_id from study_join where study_join.leader = 1 AND study_join.study_id = ?)`;
    
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디 내용 수정
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

// 만들어진 스터디 제거
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

// STUDY 생성자 = 방장
app.post('/api/studyItems/leader', (req, res) => {
    let sql = `INSERT INTO study_join VALUES (?, ?, ?)`;

    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    let leader = req.body.leader;

    let params = [study_id, person_id, leader];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 회원가입
app.post('/api/signup', (req, res) => {
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
    let sql = `SELECT * from studyitem WHERE s_id in (SELECT study_id FROM study_join WHERE person_id = ? and is_end = ?)`;
    let person_id = req.body.person_id;
    let is_end = req.body.is_end;
    
    let params = [person_id, is_end];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 코인 관리 화면에서 선택한 스터디에서의 자신의 코인 조회
app.post('/api/coinManagement/loadAccount', (req, res) => {
    let sql = `SELECT account_index FROM account_list WHERE study_id = ? AND person_id = ?;`;
    
    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    
    let params = [study_id,person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 출석체크 최초 출석자인지 확인
app.post('/api/community/isFirstAttend', (req, res) => {
    let sql = `SELECT * FROM attendance_check 
                WHERE study_id = ? AND attendance_start_date IN (SELECT attendance_start_date
                FROM attendance_check WHERE study_id = ? AND attendance_start_date = ?) 
                ORDER BY attendance_start_date DESC, attendance_start_time`;

    let study_id = req.body.study_id;
    let attendance_start_date = req.body.attendance_start_date;

    let params = [study_id, study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );

});

// 출석 여부에 따른 DB 삽입
app.post('/api/community/isAttendStatus', (req, res) => {
    let sql =`INSERT INTO attendance_check VALUES (?, ?, ?, ?, ?, ?, ?);`;

    let study_id = req.body.study_id;
    let user_id = req.body.user_id;
    let attendance_start_date = req.body.attendance_start_date;
    let attend_start_time = req.body.attendance_start_time;
    let is_attendance = req.body.is_attendance;
    let valid_attendance_time = req.body.valid_attendance_time;
    let is_first = req.body.is_first;

    let params = [study_id, user_id, attendance_start_date, attend_start_time, is_attendance, valid_attendance_time, is_first];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});  

// 최초 출석자에 따라 출석 취소 버튼 활성화하기 위한 자신이 최초 출석자인지 확인
app.post('/api/community/isFirstAttendee', (req, res) => {
    let sql = `SELECT * FROM attendance_check 
                WHERE study_id = ? AND is_first = 1 AND person_id = ? AND attendance_start_date IN (SELECT attendance_start_date
                FROM attendance_check WHERE study_id = ? AND attendance_start_date = ?) 
                ORDER BY attendance_start_date DESC, attendance_start_time`;

    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    let attendance_start_date = req.body.attendance_start_date;

    let params = [study_id, person_id, study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );    
});

// 자신의 출석 여부에 따라 달라지는 버튼 색
app.post('/api/community/isAttendanceRateBtn', (req, res) => {
    let sql =` SELECT is_attendance FROM attendance_check WHERE study_id = ? AND person_id = ? AND attendance_start_date = ? ;`;
    
    let study_id = req.body.study_id;
    let user_id = req.body.user_id;
    let attendance_start_date = req.body.attendance_start_date;

    let params = [study_id, user_id, attendance_start_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});  

// DB에서 해당 스터디 최근 날짜 불러오기
app.post('/api/quiz/getQuizDate', (req, res) => {
    // let sql =`SELECT attendance_start_date FROM attendance_check WHERE study_id=? GROUP BY attendance_start_date ORDER BY attendance_start_date DESC;`;

    let sql =`SELECT attendance_start_date FROM attendance_check WHERE study_id=? GROUP BY attendance_start_date;`;
    let study_id = req.body.study_id;

    let params = [study_id];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 출석 하지 않는 사람들 추출
app.post('/api/community/isNotAttend', parser, (req, res) => {
    let sql =` SELECT person_id FROM study_join WHERE study_id = ? AND person_id 
        NOT IN (SELECT person_id FROM attendance_check 
        WHERE study_id = ? AND attendance_start_date IN (SELECT attendance_start_date
        FROM attendance_check WHERE study_id = ? AND attendance_start_date = ?) 
        ORDER BY attendance_start_date DESC, attendance_start_time);`;

    let study_id = req.body.study_id;
    let attendance_start_date = req.body.attendance_start_date;

    let params = [study_id, study_id,study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 지각 거래 발생 유무 확인
app.post('/api/community/tardiness_deal_status', parser, (req, res) => {
    let sql = `SELECT * FROM tardiness_deal_status WHERE study_id = ? AND transaction_date = ?;`;
    let study_id = req.body.study_id;
    let transaction_date = req.body.transaction_date;

    let params = [study_id, transaction_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 거래 내역 진행 여부 저장
app.post('/api/community/inert_status_of_tardiness', parser, (req, res) => {
    let sql = `INSERT INTO tardiness_deal_status VALUES (?,?,?);`;
    let study_id = req.body.study_id;
    let transaction_date = req.body.transaction_date;
    let tardiness_status = req.body.tardiness_status;

    let params = [study_id, transaction_date, tardiness_status];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 자신을 제외한 스터디원
app.post('/api/community/receiver_list', parser, (req, res) => {
    let sql = `SELECT * FROM study_join WHERE study_id = ? AND person_id != ?;`;
    let study_id = req.body.study_id;
    let person_id = req.body.person_id;

    let params = [study_id, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

    // 지각 스마트 계약 거래를 진행 할 수 있는 사람인지 확인 - 최초 출석자 
app.post('/api/community/attendanceTradingAuthority', (req, res) => {
    let sql = `SELECT * FROM attendance_check WHERE study_id = ?  AND attendance_start_date = ? AND is_first = 1 AND person_id = ?;`;

    let study_id = req.body.study_id;
    let transaction_date = req.body.transaction_date;
    let person_id = req.body.person_id;

    let params = [study_id, transaction_date, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// DB에서 해당 스터디 최근 날짜 불러오기
// app.post('/api/quiz/getQuizDate', (req, res) => {
//     let sql =`SELECT attendance_start_date FROM attendance_check WHERE study_id=? GROUP BY attendance_start_date ORDER BY attendance_start_date DESC;`;

//     let study_id = req.body.study_id;

//     let params = [study_id];
//     connection.query(sql,params, 
//         (err, rows, fields) => {
//             res.send(rows); 
//         }
//     );
// }); 

// 스터디에 있는 스터디원 이름 불러오기
app.post('/api/quiz/getNames', (req, res) => {
    // let sql =`SELECT person_name FROM person_info WHERE person_id IN (SELECT person_id FROM study_join WHERE study_id = ?);`;
    let sql = `SELECT person_name FROM person_info WHERE person_id IN (SELECT person_id FROM attendance_check WHERE study_id = ? AND attendance_start_date = ? AND is_attendance = 1);`;
    let study_id = req.body.study_id;
    let quiz_date = req.body.quiz_date;
    
    let params = [study_id, quiz_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 퀴즈 점수 저장
app.post('/api/quiz/setQuizScore', (req, res) => {
    let sql =`INSERT INTO quiz_score VALUES(?, ?, ?, ?, ?);`;

    let study_id = req.body.study_id;
    let user_name = req.body.userName;
    let quiz_date = req.body.quiz_date;
    let user_score = req.body.user_score;
    let rank = req.body.rank;

    let params = [study_id, user_name, quiz_date, user_score, rank];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 해당 날짜의 스터디 원의 퀴즈 점수 불러오기
app.post('/api/quiz/getQuizResult', (req, res) => {
    let sql = `SELECT * FROM quiz_score WHERE study_id=? AND quiz_date=? ORDER BY score DESC;`;
    let study_id = req.body.study_id;
    let quiz_date = req.body.quiz_date;

    let params = [study_id, quiz_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 퀴즈 점수 등록 여부 확인
app.post('/api/quiz/isQuizResult', (req, res) => {
    let sql = `SELECT * FROM quiz_score WHERE study_id = ? AND quiz_date = ?`;
    let study_id = req.body.study_id;
    let quiz_date = req.body.quiz_date;

    let params = [study_id, quiz_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});


// 계좌 불러오기
app.get('/api/selectFromInitAccountList', (req, res) => {
    let sql =`SELECT * FROM init_account_list where is_use = 0 ORDER BY account_index ASC LIMIT 1;`;

    connection.query(sql,
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 계좌 속성값 변경
app.post('/api/useInitAccount', (req, res) => {
    let sql =`UPDATE init_account_list SET is_use = true WHERE account_index = ?;`;

    let account_index = req.body.account_index;

    let params = [account_index];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 



// 계좌번호 setting
app.post('/api/init_account_list', (req, res) => {
    let sql = `INSERT INTO init_account_list VALUES (?,?,?);`;

    let account_id = req.body.account_id;
    let account_num = req.body.account_num;
    let is_use = req.body.is_use;

    let params = [account_id, account_num, is_use];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );

});

//지각자의 계좌 index 얻어오기
app.post('/api/community/getLatecomerAccountId', (req, res) => {
    let sql = `SELECT * FROM account_list WHERE person_id = ? AND study_id = ?;`;
   
    let study_id = req.body.study_id;
    let latecomer_id = req.body.latecomer_id;

    let params = [latecomer_id, study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );

});


// 종료날짜인지 확인
app.post('/api/manager/callEndDateStudy', (req, res) => {
    let sql = `SELECT * FROM studyitem WHERE date(end_date)=?;`;
   
    let today = req.body.today;

    let params = [today];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );

});

// 종료날짜인 스터디에 속한 스터디원 추출
app.post('/api/manager/callEndDatePerson', (req, res) => {
    let sql = `SELECT * FROM study_join WHERE study_id = ?;`;
    let study_id = req.body.study_id;

    let params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 종료날짜인 스터디에 속한 스터디원의 계좌 정보 추출
app.post('/api/manager/callEndDatePersonAccount', (req, res) => {
    let sql = `SELECT * FROM account_list WHERE study_id = ? AND person_id = ?;`;
    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    
    let params = [study_id, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 종료날짜인 스터디 종료 여부 설정
app.post('/api/manager/endStudy', (req, res) => {
    let sql = `UPDATE studyitem SET is_end = 1 WHERE s_id = ?;`;
    let study_id = req.body.study_id;
    
    let params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 접속한 스터디가 종료된 스터디인지 확인
app.post('/api/community/isEnd', (req, res) => {
    let sql = `SELECT is_end FROM studyitem WHERE s_id = ?;`;
    let study_id = req.body.study_id;
    
    let params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 퀴즈
// person_name으로 person_id찾기
app.post('/api/community/find/person_name', (req, res) => {
    let sql = `SELECT * FROM person_info WHERE person_name = ?;`;
    let person_name = req.body.person_name;
    
    let params = [person_name];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 퀴즈
// person_name으로 person_id찾기
app.post('/api/community/find/receiver', (req, res) => {
    let sql = `SELECT * FROM quiz_score WHERE score_rank < (SELECT score_rank FROM quiz_score WHERE person_name = ?) AND quiz_date = ? AND study_id = ?;`;

    let person_name = req.body.person_name;
    let quiz_date = req.body.quiz_date;
    let study_id = req.body.study_id;
    
    let params = [person_name, quiz_date, study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

//사용자의 계좌 index 얻어오기
app.post('/api/community/getAccountId', (req, res) => {
    let sql = `SELECT * FROM account_list WHERE person_id = ? AND study_id = ?;`;
   
    let study_id = req.body.study_id;
    let person_id = req.body.person_id;

    let params = [person_id, study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );

});


app.listen(port, () => console.log(`Listening on port ${port}`));
