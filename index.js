const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = process.env.port || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
const cookieparser = require('cookie-parser'); //session data store in cookie
const session = require('express-session');
const { json } = require('body-parser');
app.use(cookieparser());
const oneday = 1000 * 60 * 60 * 24;
app.use(session({
    saveUninitialized: true, //session data(clint request) came then save
    resave: false, //one server =>many tab open {multipal request handel}
    secret: 'sujay2k0@3kd9or78', //security no hackabale
    cookie: { maxAge: oneday }
}));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'./public/login.html'));
})
app.get('/login',(req,res)=>{ //login endpoint means submit 
    if(req.session.username){
        res.redirect('/dashboard');
    }
    else{
    res.sendFile(path.join(__dirname,'./public/login.html'));
    }
})
app.get('/dashboard', (req, res) => {
    if (req.session.username) {
        res.sendFile(path.join(__dirname, './public/dashboard.html'));
    }
    else {
        res.redirect('/login');
    }
})
app.post('/login', (req, res) => {
    fs.readFile('./database.txt', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            //console.log(data);
            const alldata = JSON.parse(data);
            const viewdata = alldata.filter((item) => {
                if (item.username === req.body.uname && item.password === req.body.upass) {
                    return true;
                }
            })
            if (viewdata.length == 0) {
                res.send('/invalid password');
            }
            else {
                //res.send('welcome');
                req.session.username=req.body.uname;
                res.redirect('/dashboard');
            }
        }
    })
})
app.post('/submit',(req,res)=>{
    const rdata={
        task:req.body.input
    }
    fs.readFile('./task.txt','utf-8',(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            //console.log(data);
            const objdata=JSON.parse(data);
            objdata.push(rdata);
            const list=JSON.stringify(objdata);
            fs.writeFile('./task.txt',list,(err,data)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.send(rdata);
                }
            })
        }
    })
})
app.get("/delete/:id",(req,res)=>{
    //console.log(req.query);
    fs.readFile('./task.txt','utf-8',(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            flag=0;
            let objdata=JSON.parse(data);
            const list=objdata.filter((x)=>{
                if(x.task!=req.params.id){
                    return true;
                }
                else{
                    flag=1;
                }
            })
            if(flag==1){
            fs.writeFile('./task.txt',JSON.stringify(list),(err,data)=>{
                if(err){
                    console.log(err);
                }
                else{
                  res.send("deleted succesfully");
                }
            })
        }
        else{
            res.send("no file serch");
        }
    }
})
})
//get data
app.get('/all',(req,res)=>{
    fs.readFile('./task.txt','utf-8',(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.send(data)
        }
    })
})
app.get('/logout',(req,res)=>{
    req.session.destroy(); 
    res.redirect('/login');
})
app.listen(port, () => {
    console.log(`Running the port no ${port}`);
})