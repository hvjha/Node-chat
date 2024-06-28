const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messagesRoute")
const socket = require("socket.io")
const app = express();
require("dotenv").config();
const path = require('path')

app.use(cors());
app.use(express.json());
app.use("/api/auth",userRoutes);
app.use("/api/messages",messagesRoute);
// ============Deployment=============
const __dirname1 = path.resolve();
if(process.env.NODE_ENV=="PRODUCTION"){
    app.use(express.static(path.join(__dirname1,"/client/build")));

    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname1,"client","index.html"));
    })
}else{
    app.get("/",(req,res)=>{
        res.send("API is running Successfully")
    })
}
// =================Deployment================
mongoose.connect(process.env.MONGO_UR||"mongodb+srv://harshvardhanjha35363:12345@cluster0.fqhpsnq.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log("DB is connected Successfully");
}).catch((err)=>{
    console.log(err.message)
})

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const io = socket(server,{
    cors:{
        origin:"http://localhost:3000",
        credentials:true,
    }
})

global.onlineUsers = new Map();
io.on("connection",(socket)=>{
    global.chatSocket = socket,
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id);
    })
    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve",data.message);
        }
    })
})
