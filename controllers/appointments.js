//const { Admin } = require('mongodb');
const Appointment = require('../models/Appointment');
const Dentist = require('../models/Dentist');

exports.getAppointments=async (req,res,next)=>{
    let query;
    
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.user.id}).populate({
            path:'dentist',
            select: 'name years_of_experience area_of_expertise'
        });
    } else{//admin see all
        if(req.params.dentistId){
            console.log(req.params.dentistId);
            query = Appointment.find({dentist:req.params.dentistId}).populate({
                path: 'dentist',
                select: 'name years_of_experience area_of_expertise',
            });
        }else query = Appointment.find().populate({
            path:'dentist',
            select: 'name years_of_experience area_of_expertise'
        });

    }
    try {
        const appointments= await query;
        res.status(200).json({success:true, count:appointments.length, data: appointments});
    } catch(error){
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find Appointment"});
    }
}
exports.getAppointment=async (req,res,next)=>{
    
    try {
        const appointment= await Appointment.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name years_of_experience area_of_expertise'
        });
        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true, data: appointment});
    } catch(error){
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find Appointment"});
    }
}
exports.addAppointment=async (req,res,next)=>{
    try{
        req.body.dentist=req.params.dentistId;

        const dentist=await Dentist.findById(req.params.dentistId);

        if(!dentist){
            return res.status(404).json({success:false,message:`No dentist with the id of ${req.params.dentistId}`});
        }
        //add user Id to req.body
        req.body.user=req.user.id;

        //check for existed appointment
        const existedAppointments=await Appointment.find({user:req.user.id});

        //If the user is not an admin, they can only create 1 appointment.
        if(existedAppointments.length >= 1 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 1 appointments`});
        }

        const appointment = await Appointment.create(req.body);
        res.status(200).json({success:true, data: appointment});
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot create Appointment"});
    }
}
exports.updateAppointment=async (req,res,next)=>{
    try{
        let appointment= await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }
        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
        }
        
        appointment= await Appointment.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({success:true, data: appointment});
    } catch(error){
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot update Appointment"});
    }
}
exports.deleteAppointment=async (req,res,next)=>{
    try {
        const appointment= await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }
        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this appointment`});
        }

        await appointment.deleteOne();

        res.status(200).json({success:true, data:{}});
    } catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Appointment"});
    }
};