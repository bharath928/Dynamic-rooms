const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const cors = require("cors")
const blockRoutes = require("./Routes/blockRoutes")
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());//This is required while doing POST (or) PUT requets...

app.use("/block",blockRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Mongodb connection successfully..")
})
.catch((err)=>{
    console.log("something went wrong...",err)
})

const port = 5000

app.listen(port,()=>{
    console.log("Server is running on the server",port)
})
