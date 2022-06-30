const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const { json } = require('body-parser')
const url = 'mongodb://localhost:27017/test'
const jwt = require('jsonwebtoken')
const { Console } = require('console')

const JWT_SECRET = 'hsliutrybgrtg**@#$^&*()(&^^%fgjfyuuim'



mongoose.connect(url, function(err, db) {
   
}, err => {
    if(err) throw err;
    console.log("Fail connect to Database");
    db.close();
})

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())


app.post('/api/change-password', async (req, res) => {
    const { token, newPassword: plainTextPassword } = req.body

    //Validation password
    if(!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password'})
    }

    if(plainTextPassword.length <= 5){
        return res.json({
            status: 'error', 
            error: 'Password has to be 6 characters or more'})

    }


    try {
        const user = jwt.verify(token, JWT_SECRET)
        //..
        const _id = user.id

        const password = await bcrypt.hash(plainTextPassword, 10)
        await User.updateOne(
            {_id},
            {
                $set: { password }
            }
        )
        res.json({ status: 'ok' })
        console.log('user',user)
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', erroe : ';))' })
    }

    console.log('JWT decoded:user', user)
    res.json({ status: 'ok' })
})

 
// Login Form
app.post('/api/login', async (req, res) => {

    
    const { username, password } = req.body
    const user = await User.findOne({ username }).lean()
    console.log('user :',user)
    if(!user){
        return res.json({ status: 'error', error: 'Invalid username or password'})

    }
    if(await bcrypt.compare(password, user.password)){
        // Login successful 

        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username
            }, 
            JWT_SECRET
        )

        return res.json({ status: 'ok', data: token })
    }

   // res.json({status: 'error', data: 'Invalid username or password'})

})

// Register Form
app.post('/api/register', async (req, res) => {
    console.log(req.body)

    const { username, password: plainTextPassword } = req.body

    //Validation Username
    if(!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username'})
    }

    //Validation password
    if(!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password'})
    }

    if(plainTextPassword.length <= 5){
        return res.json({
            status: 'error', 
            error: 'Password has to be 6 characters or more'})

    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try{
        const response = await User.create({
            username,
            password
        })
        console.log('User created successfully', response)
    }catch (error) {
        //console.log(JSON.stringify(error))
        //Duplicate Error
        if(error.code === 11000){
            return res.json({ status: 'error',  error: 'Username already in use'})
        }
        throw error
        //return res.json({ status: 'error' })
    }

    //console.log(password)
    res.json({status: 'ok'})
})

app.listen(9999, () => {
    console.log('Server up at 9999')
})