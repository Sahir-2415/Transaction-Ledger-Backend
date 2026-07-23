const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"], // returns an error message if email not provided by user

        trim:true, // no extra space
        lowercase:true, // email must be in lowercase

        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid Email Address"], // verify the email address and if wrong return a error message

        unique:[true,"Email already exists"]
    },
    name:{
        type:String,
        required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minLength:[6,"password should contain more than 6 characters"],
        select:false // password un query mai nahi aayega jinme not required
    },

    systemUser:{ // this field is used to mark whether an account belongs to system or a real user
        type:Boolean,
        default:false,
        immutable:true,
        select:false // by default this user is not returned by any queries 
    }
},{
    timestamps:true // when was user created and when its data was updated
})


// If the database gets breached then the user password should remain safe with the user , so convert the password in hash and save in the db
//It is a mongoose pre save middleware hook and runs automatically before document is saved in MongoDB
userSchema.pre("save",async function (){
    if(!this.isModified("password")){
        return;
    }
    this.password=await bcrypt.hash(this.password,10); // 10 rounds of salt
    // this.password=hash;

    return;
})

userSchema.methods.comparePassword=async function(pass){
    return await bcrypt.compare(pass,this.password); 
    // this compares the password given by the user and the saved password in the db and returns true or false
}

const userModel=mongoose.model("user",userSchema);

module.exports=userModel;