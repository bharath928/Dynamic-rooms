const mongoose=require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema=new mongoose.Schema({
   userId:{
      type: String,
      required: true,
      unique : true,
   },

   password:{
      type: String,
      required: true,
   },

   dept:{
      type:String,
      // required:t,
      default:""
   },

   role:{
      type:String,
      enum:["super_admin","admin"],
      required: true,
   }
});

userSchema.pre("save", async function (n) {
   if (!this.isModified("password")) return n();
   this.password = await bcrypt.hash(this.password, 10);
   n();
 });

 const User = mongoose.model("user", userSchema);
 module.exports = User;