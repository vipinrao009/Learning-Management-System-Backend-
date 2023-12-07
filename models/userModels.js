// import { Schema, model } from "mongoose";
// import bcrypt from "bcrypt"
// import JWT from "jsonwebtoken"

// const userSchema = new Schema(
//   {
//     fullName: {
//       type: String,
//       required: [true, "Name is required!!!"],
//       minLenght: [5, "The name is atleast 5 character"],
//       maxLenght: [20, "Name should be less than 20 character"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required!!"],
//       unique: true,
//       trim: true,
//       lowercase:true
//     },
//     password: {
//       type: String,
//       required: [true, "Password id required!!!"],
//       select: false,
//       minLenght: [8, "The password should be greater than 8 charater!!"],
//     },
//     avatar: {
//       public_id: {
//         type: "String",
//       },
//       secure_url: {
//         type: "String",
//       },
//     },
//     role: {
//         type:String,
//         enum:['USER','ADMIN'],
//         default:'USER'
//     },
//     forgotPasswordToken: String,
//     forgotPasswordExpiry: Date,
//   },
//   { timestamps: true }
// );

// userSchema.pre('save',function(next){
//   if(!this.isModified('password'))
//   {
//     return next
//   }
  
//   this.password = bcrypt.hash(this.password,10)


// })

// userSchema.method = {
//   JWTtoken:async function() {
//     return await JWT.sign(
//       {id:this._id,email:this.email,subscription:this.subscription},
//       process.env.SECRET
//     )
//   },
//   comparePassword:async function(plainTextPassword){
//     return await bcrypt.compare(plainTextPassword,this.password)
//   }
// }
// const User = model("User", userSchema);

// export default User;




import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [5, 'Name must be at least 5 characters'],
      lowercase: true,
      trim: true, // Removes unnecessary spaces
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill in a valid email address',
      ], // Matches email against regex
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Will not select password upon looking up a document
    },
    subscription: {
      id: String,
      status: String,
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Hashes password before saving to the database
userSchema.pre('save', async function (next) {
  // If password is not modified then do not hash it
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
  // method which will help us compare plain password with hashed password and returns true or false
  comparePassword: async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  },

  // Will generate a JWT token with user id as payload
  generateJWTToken: async function () {
    return await jwt.sign(
      { id: this._id, role: this.role, subscription: this.subscription },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  }
};

const User = model('User', userSchema);

export default User;
