const { query } = require('express');
const Dentist = require('../models/Dentist');

exports.getDentists=async (req,res,next)=>{
    let query;

    //Copy req.query
    const reqQuery= {...req.query};

    //Fields to exclude
    const removeFields =['select','sort','page','limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    //Create operators
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
    //findding resource
    query=Dentist.find(JSON.parse(queryStr)).populate('appointments');

    //Select Fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }
    //sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else{
        query=query.sort('name');
    }
    //Pagination
    const page=parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
 
    try{
        const total= await Dentist.countDocuments();
        query=query.skip(startIndex).limit(limit);
        //Excute query
        const dentists = await query;
        //Pagination result
        const pagination ={};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }
        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true, count: dentists.length , pagination, data:dentists});
    } catch(err){
        res.status(400).json({success:false});
    }
};

exports.getDentist=async (req,res,next)=>{
    try{
        const dentist = await Dentist.findById(req.params.id);
        if(!Dentist){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data:dentist});
    } catch(err){
        res.status(400).json({success:false});
    }
};

exports.createDentist=async (req,res,next)=>{
    const dentist = await Dentist.create(req.body);
    res.status(201).json({success:true, data:dentist});
};

exports.updateDentist=async (req,res,next)=>{
    try{
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true
        });
        if(!Dentist){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data:dentist});
    } catch(err){
        res.status(400).json({success:false});
    }
};

exports.deleteDentist=async (req,res,next)=>{
    try{
        const dentist = await Dentist.findById(req.params.id);
        if(!Dentist){
            return res.status(400).json({success:false});
        }
        await dentist.deleteOne();
        res.status(200).json({success:true, data:{}});
    } catch(err){
        res.status(400).json({success:false});
    }
};