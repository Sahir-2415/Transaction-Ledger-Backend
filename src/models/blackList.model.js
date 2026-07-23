const mongoose=require('mongoose');

const blackListSchema= new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required to blacklist"],
        unique:[true,"token is already blacklisted"]
    },
},{
    timestamps:true
})

//asking mongo db to delete the JWT itself after 3 days
blackListSchema.index({createdAt:1},{
    expireAfterSeconds:60*60*24*3
})

const blackListModel=mongoose.model("blackList",blackListSchema);

module.exports=blackListModel