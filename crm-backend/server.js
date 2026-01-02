
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

app.post('/businesses', async (req, res) => {
  try {
    const { name, owner_name, industry, phone, email } = req.body;

    if (!name || !owner_name || !phone) {
      return res.status(400).json({
        error: 'Name, owner name and phone are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO businesses (name, owner_name, industry, phone, email)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, owner_name, industry, phone, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /businesses error:', err);
    res.status(500).send('Error creating business');
  }
});




// LEADS

app.post('/leads', async (req, res) => {
  try {
    console.log(req.body);
    const { business_id, name, phone, email, source_id } = req.body;

    if (!business_id || !name || !source_id) {
      return res.status(400).json({
        error: 'business_id, name and source_id are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO leads (business_id, name, phone, email, source_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [business_id, name, phone, email, source_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /leads error:', err);
    res.status(500).send('Error creating lead');
  }
});



app.get('/leads', async (req, res) => {
  try {
    const { business_id } = req.query;

    const result = await pool.query(
      `SELECT * FROM leads WHERE business_id=$1`,
      [business_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error fetching leads');
  }
});


//INTERACTIONS

app.post('/interactions',async(req,res)=>{
    try{
        const{lead_id,type,note}=req.body;
        const result =await pool.query(
            `INSERT INTO interactions (lead_id,type,note)
            VALUES ($1,$2,43) RETURNING *`,
            [lead_id,type,note]
        );
        res.json(result.rowa[0]);
    }catch(err){
        res.status(500).send('Error creating interaction');
    }
});

/* ---------------- DEALS ---------------- */

app.post('/deals', async (req, res) => {
  try {
    const { lead_id, amount, status } = req.body;

    const result = await pool.query(
      `INSERT INTO deals (lead_id, amount, status, closed_at)
       VALUES ($1,$2,$3, NOW()) RETURNING *`,
      [lead_id, amount, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error creating deal');
  }
});


/* ---------------- ANALYTICS ---------------- */

app.get('/analytics/funnel', async (req, res) => {
  try {
    const { business_id } = req.query;

    const total = await pool.query(
      'SELECT COUNT(*) FROM leads WHERE business_id=$1',
      [business_id]
    );

    const converted = await pool.query(
      `SELECT COUNT(*) FROM deals
       JOIN leads ON deals.lead_id = leads.id
       WHERE leads.business_id=$1 AND deals.status='won'`,
      [business_id]
    );

    res.json({
      total_leads: total.rows[0].count,
      converted: converted.rows[0].count
    });
  } catch (err) {
    res.status(500).send('Analytics error');
  }
});

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});

