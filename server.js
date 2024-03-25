const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path:'./config/config.env'});
connectDB();

//Route files
const dentists = require('./routes/dentists');
const appointments = require('./routes/appointments');
const auth = require('./routes/auth');

const app=express();

app.use(express.json());
app.use(cookieParser());

//Mount routers
app.use('/api/v1/dentists' ,dentists);
app.use('/api/v1/appointments', appointments);
app.use('/api/v1/auth',auth);

const PORT=process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', 
process.env.NODE_ENV, 'on ' + process.env.HOST + ":" + PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});