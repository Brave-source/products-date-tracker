const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// Register

router.post('/register', async (req, res) => {
    try{
        
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(
                req.body.password,
                process.env.PASS_SEC
            ).toString(),
        })
        const user = await newUser.save();
        res.status(200).json(user);
    } catch(err){

        res.status(500).json(err);
    }
})

// Login
router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne({username: req.body.username});
        !user && res.status(400).json("Wrong credentials");

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        )
        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        OriginalPassword !== req.body.password && 
            res.status(400).json("Wrong credentials")
        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
        );
        const {password, ...others} = user._doc;
        console.log(others)
        res.status(200).json({...others, accessToken});
    } catch(err) {
        console.log(err)
        res.status(500).json(err);
    }
})

module.exports = router;