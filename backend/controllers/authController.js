const User=require("../models/usermodel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET=process.env.JWT_SECRET;

const registerUser=async (req,res)=>{
    try{
        const {userId,password,role}=req.body;

        let user=await User.findOne({userId});
        if(user)
            return res.status(400).json({message:"user already exists"});

        user = new User({ userId, password, role });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    }catch(err)
    {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};



const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    console.log("reciives");
    
    const rollNumberPattern = /^[0-9]{2}A51A[0-9]{2}[0-9A-Z]{2}$/; 

    if (rollNumberPattern.test(userId)) {
      console.log("rollnumber");
      const token = jwt.sign({ userId, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token, role: "student" }); 
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};





  
  module.exports = { registerUser, loginUser };