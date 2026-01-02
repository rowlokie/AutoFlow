const express =require("express");
const cors =require ("core");

const app =express();
app.use(cors());
app.use(express.json());

module.exports=app;