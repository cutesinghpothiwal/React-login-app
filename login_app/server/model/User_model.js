import mongoose, { mongo } from 'mongoose'

export const UserSchema  = new mongoose.Schema({
    username : {
        type : String,
        required : [true , "Please provide a unique Username"],
        unique : [true , "Username Exist"]
    }, 
    password : {
        type: String,
        required : [true , "please provide a password "],
        unique : false , 
    },
    email : {
        type :String,
        required : [true , "please provide a unique Email "],
        unique : true,
    },
 
    firstname : {type : String},
    lastname : {type : String},
    mobile : {type : String},
    address : {type : String},
    profile : {type : String},



});


export default mongoose.model.Users || mongoose.model('User',UserSchema);