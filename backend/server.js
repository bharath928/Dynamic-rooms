const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const blockRoutes = require("./Routes/blockRoutes");
const authRoutes = require("./Routes/authRoutes"); 
const Timetable = require("./Routes/timetableRoutes");
// const TimetableUploadRoutes = require("./Routes/timetableUploadRoutes");
dotenv.config();
// const protectedRoutes = require("./Routes/protectedRoutes");

const app = express();

app.use(cors());
app.use(express.json()); 


app.use("/block", blockRoutes);
app.use("/auth", authRoutes); 
app.use("/periods",Timetable);
// app.use("/timetable", TimetableUploadRoutes);
// app.use("/api", protectedRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() =>{
    console.log("MongoDB connected successfully..")
})
.catch((err) =>{
    console.error("something went wrong...", err)
});

const port=  5000 || process.env.PORT;
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
});
