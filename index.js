const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/logdemo')
.then(()=>{
    console.log("mongo connected !!");
})
.catch((err)=>{
    console.log("oops!! mongo not connected");
    console.log(err);
})

app.set('view engine','ejs');
app.set('views','views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.get('/',(req, res)=>{
    res.send("You are in home page !!")
})

app.get('/register',(req, res)=>{
    res.render('register');
})

app.post('/register',async (req, res) => {
    const{password,username} = req.body;
    const hash = await bcrypt.hash(password,12)
    const user = new User({
        username,
        password:hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
})

app.get('/login',(req, res)=>{
    res.render('login');
})

app.post('/login',async (req, res)=>{
    const{username, password} = req.body;
    const user = await User.findOne({username});
    const validPassword = await bcrypt.compare(password, user.password);
    if(validPassword){
        req.session.user_id = user._id;
        res.send(`Welcome ${username} !! `);
        res.redirect('/secret')
    }
    else {
        res.redirect('/login')
    }
})

app.get('/secret',(req, res)=>{
    if(!req.session.user_id){
        res.redirect('/login');
    }
    res.render('secret');
})

app.post('/logout', (req, res)=>{
    req.session.destroy();
    res.render('login');
})



app.listen(3000,()=>{
    console.log("Server started on port 3000 !!");
})