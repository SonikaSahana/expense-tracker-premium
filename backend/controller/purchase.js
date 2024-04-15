const Razorpay = require('razorpay');
const crypto = require('crypto')
require('dotenv').config();
const jwt = require('jsonwebtoken')


const Order = require('../models/order')
const User = require('../models/user');
const mongoose= require('../util/db');





var rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
 key_secret: process.env.RAZORPAY_KEY_SECRET

});


// exports.purchaseMembership = async (req, res) => {
//   try {

//     console.log(process.env.RAZORPAY_KEY_ID)



//     var options = {
//       amount: 50000,  // amount in the smallest currency unit
//       currency: "INR",
//       receipt: "order_rcptid_11"
//     };
//     let order;
//     const orders = await req.user.getOrders({ where: { status: "PENDING" } })
//     console.log(order)
//     if (orders.length == 0) {

//       order = await rzp.orders.create(options)
//       console.log(order);
//       await req.user.createOrder({ order_id: order.id, status: "PENDING" })
//       return res.json({ order_id: order.id, key: rzp.key_id })
//     }
//     order = orders[0]
//     console.log("orders")
//     const result = await rzp.orders.fetchPayments(order.order_id)
//     // rzp.orders.
//     if(result.count == 0){
//       return res.json({ order_id: order.order_id, key: rzp.key_id })
//     }else{
//       let item = result.items[0]

//       order.payment_id = item.id
//       if(item.captured){
//         order.status = "SUCCESSFUL"
//         req.user.isPremiumUser = true
//         await req.user.save();
//         const token = jwt.sign({id : req.user.id , isPremiumUser : true} , process.env.JWT_TOKEN)
//         await order.save()
//         return res.json({ success: true, msg: "payment complete", token ,isPremiumUser : true})
//       }else{

//         order.status = "FAILED"
//         await order.save()
//         return res.json({ success: false, msg: "payment failed",isPremiumUser : false })

//       }

//     }


//   } catch (e) {
//     console.log(e)
//     return res.status(500).json({ msg: "Internal server error" })


//   }


// }
exports.purchaseMembership = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: 50000,  // amount in the smallest currency unit (e.g., paise for INR)
      currency: "INR",
      receipt: "order_rcptid_11"
    };

    let order;

    // Check if the user has any pending orders
    const orders = await Order.find({ user_id: req.user._id, status: "PENDING" });

    if (orders.length === 0) {
      // Create a new order if no pending orders found
      order = await rzp.orders.create(options);
      await Order.create({ user_id: req.user._id, order_id: order.id, status: "PENDING" });
    } else {
      // Use the existing pending order
      order = orders[0];
    }

    // Fetch payments for the order
    const payments = await rzp.orders.fetchPayments(order.order_id);

    if (payments.count === 0) {
      // No payments made yet, return order details
      return res.json({ order_id: order.order_id, key: process.env.RAZORPAY_KEY_ID });
    } else {
      // Payment(s) found
      const payment = payments.items[0];

      // Update order status based on payment status
      if (payment.captured) {
        order.status = "SUCCESSFUL";
        req.user.isPremiumUser = true;
        await req.user.save();

        // Generate JWT token with updated premium status
        const token = jwt.sign({ id: req.user._id, isPremiumUser: true }, process.env.JWT_TOKEN);

        await order.save();
        return res.json({ success: true, msg: "Payment complete", token, isPremiumUser: true });
      } else {
        order.status = "FAILED";
        await order.save();
        return res.json({ success: false, msg: "Payment failed", isPremiumUser: false });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

exports.successfullTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orders = await Order.find({ user_id: req.user._id, status: "PENDING" }).session(session);

    const payment_id = req.body.payment_id;
    const signature = req.body.razorpay_signature;

    if (orders.length > 0) {
      const order = orders[0];
      const data = `${order.order_id}|${payment_id}`;
      const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(data).digest('hex');

      if (generated_signature === signature) {
        const payment = await rzp.payments.fetch(payment_id);

        if (payment.status === "captured") {
          await order.updateOne({ payment_id: payment_id, status: "SUCCESSFUL" }).session(session);
          await req.user.updateOne({ isPremiumUser: true }).session(session);

          const token = jwt.sign({ id: req.user._id, isPremiumUser: true }, process.env.JWT_TOKEN);

          await session.commitTransaction();
          session.endSession();

          return res.json({ success: true, msg: "Payment complete", token, isPremiumUser: true });
        } else {
          await order.updateOne({ status: "FAILED" }).session(session);

          await session.commitTransaction();
          session.endSession();

          return res.json({ success: false, msg: "Payment failed", isPremiumUser: false });
        }
      } else {
        await session.abortTransaction();
        session.endSession();

        return res.status(401).json({ msg: "Not authorized" });
      }
    } else {
      await session.abortTransaction();
      session.endSession();

      return res.status(403).json({ msg: "No order found" });
    }
  } catch (e) {
    console.error(e);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ msg: "Internal server error" });
  }
};

exports.failedTransaction = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id, status: "PENDING" });

    if (orders.length > 0) {
      const order = orders[0];
      const payment_id = req.body.payment_id;
      const payment = await rzp.payments.fetch(payment_id);

      if (payment.status === "failed") {
        order.status = "FAILED";
        order.payment_id = payment_id;
        await order.save();

        return res.json({ success: false, msg: "Transaction failed", isPremiumUser: false });
      }
    } else {
      return res.status(403).json({ msg: "No order found" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: "Internal server error" });
  }
};