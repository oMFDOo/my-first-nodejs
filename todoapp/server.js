/************************/
/* 기본 셋팅을 작성하자  */
/************************/

/// 서버를 띄우기 express 라이브러리 기본 셋팅
const express = require('express');
const app = express();
// POST로 받은 데이터를 파싱하기 위해 설치 후 기본 셋팅
app.use(express.urlencoded({ extended: true }))
// 몽고 DB 접속하기
const MongoClient = require('mongodb').MongoClient;
// ejs 등록
app.set('view engine', 'ejs')

// 서버띄울 포트번호, 띄운 후 실행 코드
app.listen(8080, function(){
    console.log('listening on 8080');
});



/************************/
/* GET 요청을 처리해보자 */
/************************/

// /pet로 방문 시 /pet 관련 안내문 띄우기
// get('방문경로', function(요청 , 응답))
app.get('/pet', function (req, res) {
    res.send('환영합니다 여기에 당도한 이여 여기는 pet 경로입니다.');
});

// 과제 : /beauty URL로 방문 시 /beauty 관련 안내문 띄우기
app.get('/beauty', function (req, res) {
    res.send('환영합니다 여기에 당도한 이여 여기는 beauty 경로입니다.');
});



/************************/
/* HTML 파일을 send하자 */
/************************/

// '/'는 로컬 패치라고 보면 된다.
app.get('/', function (req, res) {
    // 여기 접속하면 이 파일을 저기다가 보내세요
    res.sendFile(__dirname + '/index.html');
});




/************************/
/* FORM의 POST요청 받기 */
/************************/

// 과제 : /write URL로 방문 시 /write 관련 페이지 띄우기
app.get('/write', function (req, res) {
    res.sendFile(__dirname + '/write.html');
});

// /add 경로로 POST 요청을 했을 때 무언갈 하기
// app.post('/add', function (req, res) {
//     // res.send(JSON.stringify(req.body)); : 페이지에 정보 출력
//     console.log(req.body)
//     res.send(req.body);
// });




/************************/
/*   mongoDB 셋팅하기   */
/************************/
var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.hkmtq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (err, client) {
        if (err) { return console.log(err); }

        // 데이터베이스(폴더) 'todoapp'에 연결한다. 
        db = client.db('todoapp');

})

// 어떤 사람이 /add 라는 경로로 post 요청을 하면, 
// 데이터 2개(날짜, 제목)를 보내주는데,
// 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장하기
app.post('/add', function (req, res) {
    console.log(req.body)
    res.send(req.body);

    // 총 게시물 수 데이터 DB에서 가져오기
    const countData = db.collection('counter').findOne({name : '게시물갯수'} , function(err, result){
        var totlaPostCount = result.totalPost;

        // 콜렉션(파일) 'post'에 연결한다.
        // insertOne('저장할 데이터', function(에러, 결과){})
        // 이 때 _id 속성은 필수 내용인데, 지정하지 않을 시 DB에서 자동으로 부여해준다.
        // 현재 id는 auto increment를 구현해 번호를 부여해줄 것이다. (몽고디비에는 이 기능 지원하지 않기 때문) 
        db.collection('post').insertOne({ _id: totlaPostCount + 1, 날짜: req.body.date, 제목: req.body.title }, function (err, result) {
            console.log(req.body);
            // counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜줘야 한다. (DB 수정, update)
            // updateOne({어떤 데이터를 수정할 지}, {$오퍼레이터 {수정값}}, function(){});
            // operator : $set(변경), $inc(증가), $min(기존값보다 적으면 변경), $rename(key값 이름 변경)
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPost : 1}}, function(err, result){
                if(err){return console.log(err)} // 콜백 함수 자체를 생략할 수도 있다. 
            }); // many 항목도 있당
        });

    });

});



/************************/
/* HTML에 DB데이터 꽂기 */
/************************/

// /list로 GET요청으로 접속하면
// DB 저장 데이터를 예쁘게 꾸며진 html로 보여줌
app.get('/list', function(req, res){

    // DB에 저장된 'post'라는 collection에서 모든 데이터를 탐색한다.
    db.collection('post').find().toArray(function(err, result){
        console.log(result);
        // 탐색한 데이터를 ejs에 집어넣고 파일 렌더링
        res.render('list.ejs', {posts : result});
    });
});



/************************/
/* HTML에 DB데이터 삭제 */
/************************/

app.delete('/delete', function(req, res){
    req.body._id = parseInt(req.body._id);  
    console.log(req.body);
    // req.body에 담겨온 게시물 번호를 이용해서 삭제
    db.collection('post').deleteOne(req.body, function(err, result){
        console.log('삭제 완료');
    });
});