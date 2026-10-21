import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";
import User from "../../models/user.model.mjs";

const registerSchema=z.object({
    name:z.string().trim().min(2).max(100),
    email:z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
department: z.string().trim().max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

function createToken(user){
    const secret=process.env.JWT_SECRET;
     if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

 return jwt.sign({
    sub:user._id.toString(),
   ver:user.tokenVersion
  },secret,{
     expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      algorithm: "HS256",
  })
}

function publicUser(user){
return {
    id:user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    department:user.department,
    status:user.status
}
}

export async function registerUser(input) {
const data=registerSchema.parse(input);
const email=data.email.toLowerCase();
const existingUser=await User.findOne({email});
 if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }
  const passwordHash=await bcrypt.hash(data.password,12);
  const user=await User.create({
    name:data.name,
    email,
    passwordHash,
     department: data.department || "General",
    role: "Employee",

  })
    return publicUser(user);
}

export async function loginUser(input) {
const data =loginSchema.parse(input);
const user=await User.findOne({email:data.email.toLowerCase()}).select("+passwordHash");

if(!user || !(await bcrypt.compare(data.password, user.passwordHash))){
     const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
}
 if (user.status !== "Active") {
    const error = new Error("Account is not active");
    error.statusCode = 403;
    throw error;
  }

  const token =createToken(user);
  return {
   user: publicUser(user),
    token
  }
}

export async function getCurrentUser(userId){
  const user = await User.findById(userId);

  if (!user || user.status !== "Active") {
    const error = new Error("User account is unavailable");
    error.statusCode = 401;
    throw error;
  }

  return publicUser(user);
}

export async function logout(userId){
const user=await User.findByIdAndUpdate(userId,{
    $inc:{tokenVersion:1}
},{new:true}
)
 if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return { message: "Logged out successfully" };
}