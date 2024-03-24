import UserModel from "../model/User_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import optGenerator, { generate } from "otp-generator"


//middleware to verify user
export async function verifyUser(req, res, next) {
  try {
      let username;
      if (req.query.username) {
          username = req.query.username;
      } else if (req.body.username) {
          username = req.body.username;
      } else {
          return res.status(400).send({ error: "Username not provided" });
      }

      const exist = await UserModel.findOne({ username });
      if (!exist) {
          return res.status(404).send({ error: "User not found" });
      }

      next();
  } catch (error) {
      return res.status(500).send({ error: "Internal server error" });
  }
}



// post request will be made along with the data to create the data about the user
export async function register(req, res) {
  try {
    // Destructuring the data
    const { username, password, profile, email } = req.body;
    const existUsername = await UserModel.findOne({ username });
    const existEmail = await UserModel.findOne({ email });

    if (existEmail) {
      throw new Error("Please use a unique email");
    }
    if (existUsername) {
      throw new Error("Please use a unique username");
    }
    if (!password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      username,
      password: hashedPassword,
      profile: profile || "",
      email,
    });
    await user.save();

    res.status(201).send({ msg: "User registration successful" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send({ error: error.message || "Failed to register user" });
  }
}


// the function will POST request at http://localhost:8000/api/login
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "Username not found" });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    
    if (!passwordCheck) {
      return res.status(400).send({ error: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userid: user.id,
        username: user.username,
      },
      ENV.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).send({
      msg: "Login successful",
      username: user.username,
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send({ error: "Internal server error" });
  }
}


//GET request at the http://localhost:8000/api/user/example
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).send({ error: "Invalid Username" });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Omitting the password field from the user object
    const { password, ...userData } = user.toObject();

    return res.status(200).send(userData);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
}

//PUT request is made to update at http://localhost:8000/api/updateuser
export async function updateUser(req, res) {
  try {
    // Check if req.user exists to ensure user is authenticated
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized access" });
    }
    console.log(req.user)
    const { userid } = req.user;
    const body = req.body;
    console.log(userid)
    UserModel.updateOne({ id: userid }, body)
      .then((result) => {
        if (result.nModified === 0) {
          return res.status(404).send({ error: "No user found or no changes made" });
        } else {
          return res.status(200).send({ msg: "Record updated" });
        }
        
      })
      .catch((err) => {
        console.error("Error:", err);
        return res.status(500).send({ error: "Internal server error" });
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
}

//get request to generate otp
export async function generateOTP(req, res) {
req.app.locals.OTP =  await optGenerator.generate(6, {lowerCaseAlphabets : false , upperCaseAlphabets : false , specialChars : false})
res.status(201).send({code: req.app.locals.OTP})

}

//GET request generate otp
export async function verifyOTP(req, res) {
const {code} = req.query
if(parseInt(req.app.locals.OTP) === parseInt(code)){
  req.app.locals.OTP = null // reset the otp value
  req.app.locals.resetSession = true // start the session for reset password
  return res.status(201).send({ msg: "Verify succesfull"})

 }
 return res.status(400).send({error : "Invalid OTP"})
}

//get request to reset the session
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false
    return res.status(201).send({msg: "Access granted"})
  }
  return res.status(400).send({error : "session expired"})
}

//PUT request to update the user password

export async function resetPassword(req, res) {
  try {
    if(!req.app.locals.resetSession){
      return res.status(440).send({error : "Session Expired"});
    }
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username }); // Use await to resolve the promise

    if (!user) {
      return res.status(404).send({ error: "Username not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Use await to resolve the promise

    await UserModel.updateOne({ username: user.username }, { password: hashedPassword }); // Use await to resolve the promise
    req.app.locals.resetSession =false
    return res.status(201).send("Record updated successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}
