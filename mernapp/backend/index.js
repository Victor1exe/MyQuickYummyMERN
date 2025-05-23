
const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000;
const mongoDB = require("./db")
mongoDB();
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With,Content-Type,Accept"
      );
      next();
})

app.use(express.json())
app.use('/api', require("../backend/Routes/Createuser"));
app.use('/api', require("../backend/Routes/DisplayData"));
app.use('/api', require("../backend/Routes/OrderData"));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
