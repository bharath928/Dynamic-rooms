const block = require("../models/blockmodel")

const createBlock = async (req,res)=>{
    try{
        const blockData = new block(req.body)//instance created
        const result = await blockData.save()//insert into the db..

        res.status(201).json(result)
    }catch(err){
        // console.log(err)
        res.status(400).json({"msg":"error occured"})
    }
}

const getBlockDetails = async (req,res)=>{
    try{
        const result = await block.find();
        res.status(200).json(JSON.stringify(result))
    }
    catch(err){
        console.error(err)
        res.status(400).json({"msg":"something went wrong..."})
    }
}

const getBlockDetailsbyId = async (req,res)=>{
    const {id }= req.params;
    try{
        const result = await block.findById(id);
        res.status(200).json(result)
    }
    catch(err){
        console.error(err)
        res.status(400).json({"msg":"something went wrong..."})
    }
}

const deleteBlock = async (req,res)=>{
    const {id }= req.params;
    try{
        const result = await block.findByIdAndDelete(id);
        res.status(200).json(result)
    }
    catch(err){
        console.error(err)
        res.status(400).json({"msg":"something went wrong..."})
    }
}

module.exports = {createBlock,getBlockDetails,getBlockDetailsbyId,deleteBlock};