const User=require("../models/usermodel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET=process.env.JWT_SECRET;

const registerUser=async (req,res)=>{
    try{
        const {userId,password,dept}=req.body;

        let user=await User.findOne({userId});
        if(user)
            return res.status(400).json({message:"user already exists"});

        user = new User({ userId, password,dept,role :"admin"});
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
    // console.log("reciives");

    if(userId && password){
      const user = await User.findOne({ userId });
      if (!user) return res.status(400).json({ message: "admin not found.." });
      // console.log(user)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Password incorrect..." });

      const token = jwt.sign({ "userId": user.userId, "role"
        : user.role,"dept":user.dept}, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ token });
    }else{
      const rollNumberPattern = /^[0-9]{2}[A-Z]51[A-Z][0-9]{2}[0-9A-Z]{2}$/i;
      const facultyPattern = /^A5[A-Za-z]{3}00T[0-9]{2}$/i; 
      if (!rollNumberPattern.test(userId) && !facultyPattern.test(userId)){
        return res.status(400).json({message:"Student ID not matched.."})
      }
      const token = jwt.sign({ userId, "role": "student","dept":"" }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token, role: "student" }); 
    } 
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};


const userCollection = async(req,res)=>{
    try{
      const {userid} = req.params
      const user = await User.findOne({ "userId":userid });
      if (!user) return res.status(400).json({ message: "admin not found.." });
      res.status(200).json(user)
    }catch(err){
      res.status(500).json({msg:err.message})
    }
}


const adminDetails = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }); // Fetch only admins
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "Admins not found" });
    }
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteadmin=async (req,res)=>{
 
    const {adminid}=req.params;
    try{
      const result=await User.findByIdAndDelete(adminid);

      return res.status(200).json(result);
    }catch(e)
    {
    console.error(e)
    res.status(400).json({"msg":"something went wrong..."});
  }
}

  
  module.exports = { registerUser, loginUser ,userCollection,adminDetails,deleteadmin};