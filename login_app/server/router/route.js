import { Router } from "express";
import * as controller from '../controller/appController.js'
import { registerMail } from "../controller/mailer.js";
import auth , {localVariables} from '../middleware/auth.js'
const router = Router();



// POST methods
router.route("/register").post(controller.register)
router.route("/registermail").post(registerMail)
router.route("/authenticate").post(controller.verifyUser,(req, res) => { res.end() })//res.end is used to end the reposnse without sending any data 
router.route("/login").post(controller.verifyUser,controller.login)






// GET methods
router.route("/user/:username").get(controller.getUser)
router.route("/generateOTP").get(controller.verifyUser,localVariables,controller.generateOTP)
router.route("/verifyOTP").get(controller.verifyUser,controller.verifyOTP)
router.route("/createResetSession").get(controller.createResetSession)



// PUT methods
router.route("/updateUser").put(auth,controller.updateUser)
router.route("/resetPassword").put(controller.verifyUser,controller.resetPassword)




export default router;
