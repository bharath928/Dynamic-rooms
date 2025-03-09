const mongoose = require("mongoose")
const { type } = require("os")

const roomSchema = new mongoose.Schema({
    room_id:{ // GF,FF...
        type:String,
        required:true,
        default:""
    },
    room_name:{ // III CSE C,...
        type:String,
        required:true,
        default:""
    },
    room_type:{//teaching,faculty cabins, labs,....
        type:String,
        required:true,
        default:""
    },
    room_capacity:{
        type:Number,
        required:true,
        default:0
    },    
    occupied:{
        type:Boolean,
        required:true,
        default:false
    },
    lastModifiedDate:{
        type:Date,
        default:Date.now
    }
})

roomSchema.pre("save",(next)=>{
    this.lastModifiedDate = new Date();
    next()
})

const floorSchema = new mongoose.Schema({
    floor_name:{
        type:String,
        required:true,
        default:""
    },
    // no_of_class:{
    //     type:Number,
    //     required:true,
    //     default:0
    // },

    //No of rooms = rooms.length...
    rooms:{
        type:[roomSchema],
        required:true,
        default:[]
    }
})

const blockSchema = new mongoose.Schema({
    block_name:{
        type:String,
        required:true,
        default:""
    },
    no_of_floor:{
        type:Number,
        required:true,
        default:0
    },
    floors:{
      type:[floorSchema],
        required:true,
        default:[]
    },
})

module.exports = mongoose.model("block",blockSchema);