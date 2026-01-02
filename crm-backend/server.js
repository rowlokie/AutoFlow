
const express=require('express');
const cors=require('cors');
const pool=require('./src/config/db');

const app=express();
app.use(cors());
app.use(express.json());

const PORT=process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('CRM Backend is running! ');
});

app.get('/businesses',async(req,res)=>{
    try{
        const result =await pool.query('SELECT * FROM businesses');
        res.json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});

