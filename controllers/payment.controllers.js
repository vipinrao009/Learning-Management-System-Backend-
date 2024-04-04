import Payment from "../models/payment.model.js";
import User from "../models/userModels.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.utils.js";

// getRazorKey is for fronted
const getRazorKey = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "RAZORPAY API KEY",
    key: process.env.RAZOR_KEY_ID,
  });
};

const buySubscription = async (req, res, next) => {
  const { id } = req.user;

  //check the user that is exist in db or not
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("Unauthorized, plz login agin", 401));
  }

  //ADMIN can't purchase the course 
  if (user.role === "ADMIN") {
    return next(new AppError("Admin can not purchase a subscription!!!", 401));
  }

  try {
    const option = {
      plan_id: process.env.RAZOR_PLAN_ID,
      customer_notify: 1, //1 means razorpay will handle notifying the customer, 0 means we will not notify the customer
      total_count: 12, // 12 means it will charge every month for a 1-year sub.
    }
    
    const subscription = await razorpay.subscriptions.create(option);

    // Adding the ID and the status to the user account
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    //Finally save all the changes
    await user.save();

    res.status(200).json({
      success: true,
      message: "subscribed successfully",
      subscription_id: subscription.id,
    });
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

const verifySubscription = async (req, res, next) => {
  const { id } = req.user;

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    req.body;

  // Finding the user
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("Unauthorized , please login again", 400));
  }

  try {
    // Getting the subscription ID from the user object
    const subscriptionID = user.subscription.id;

    const generateSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    // Check if generated signature and signature received from the frontend is the same or not
    if (generateSignature !== razorpay_signature) {
      return next(new AppError("Payment not verified", 401));
    }

    // If they match successfuly then create payment and store it in the DB
    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    user.subscription.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment is verified successfully!!",
    });
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

const cancelSubscription = async (req, res, next) => {
  const { id } = req.user;

  //Destract the Id from db
  const subscriptionID = user.subscription.id;

  //Find the user in db through the id
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User Does not exist!!!", 400));
  }

  // Checking the user role
  if (user.role === "ADMIN") {
    return next(
      new AppError("Admin does not need to cannot cancel subscription", 400)
    );
  }

  try {
    //Cancel the subscription
    const subscription = razorpay.subscriptions.cancel({
      subscriptionID,
    });

    //Update the status whether complete or failed
    user.subscription.status = subscription.status;

    await user.save();
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

const allPayment = async (req, res, next) => {
  const { count } = req.query;

  //Find all the subscription from razorpay
  const allPayment = await razorpay.subscriptions.all({
    count: count || 10, // If count is sent then use that else default to 10
    skip: skip ? skip : 0, // // If skip is sent then use that else default to 0
  })

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const finalMonths = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const monthlyWisePayments = allPayments.items.map((payment) => {
    // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
    const monthsInNumbers = new Date(payment.start_at * 1000);

    return monthNames[monthsInNumbers.getMonth()];
  });

  monthlyWisePayments.map((month) => {
    Object.keys(finalMonths).forEach((objMonth) => {
      if (month === objMonth) {
        finalMonths[month] += 1;
      }
    });
  });

  const monthlySalesRecord = [];

  Object.keys(finalMonths).forEach((monthName) => {
    monthlySalesRecord.push(finalMonths[monthName]);
  });


  res.status(200).json({
    success:true,
    message:"All Payment!!",
    allPayment,
    finalMonths,
    monthlySalesRecord,
  })
};
export { getRazorKey, buySubscription, verifySubscription, cancelSubscription ,allPayment};
