import AppError from "../utils/error.utils.js";
import sendEmail from "../utils/sendEmail.js"

export const contactUs = async(req,res,next)=>{
    const {name,email,message} = req.body;

    if(!name || !email || !message){
        return next(new AppError('Name, Message and Email are required'))
    }

    try {
        const subject = 'Contact Us Form'
        const textMessage = `${name} - ${email} <br/> ${message}`

        //Await the send the email
        await sendEmail(process.env.CONTACT_US_EMAIL,subject,textMessage)
    } catch (error) {
        console.log(error);
        return next(new AppError(error.message, 400))
    }

    res.status(200).json({
        success: true,
        message: 'Your request has been submitted successfully',
    })
}