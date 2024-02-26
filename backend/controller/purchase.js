const Razorpay = require('razorpay');
const crypto = require('crypto')
require('dotenv').config();
const jwt = require('jsonwebtoken')


const Order = require('../models/order')
const User = require('../models/user');
const sequelize = require('../util/db');





var rzp = new Razorpay({
 // key_id: process.env.RAZORPAY_KEY_ID,
 //key_secret: process.env.RAZORPAY_KEY_SECRET
 key_id: "rzp_test_wmoM19zvZT2GIR",
key_secret: "ZkQd9XfdzYGFrDn4mnwNap0L"
});


exports.purchaseMembership = async (req, res) => {
  try {

    console.log(process.env.RAZORPAY_KEY_ID)



    var options = {
      amount: 50000,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    let order;
    const orders = await req.user.getOrders({ where: { status: "PENDING" } })
    console.log(order)
    if (orders.length == 0) {

      order = await rzp.orders.create(options)
      console.log(order);
      await req.user.createOrder({ order_id: order.id, status: "PENDING" })
      return res.json({ order_id: order.id, key: rzp.key_id })
    }
    order = orders[0]
    console.log("orders")
    const result = await rzp.orders.fetchPayments(order.order_id)
    // rzp.orders.
    if(result.count == 0){
      return res.json({ order_id: order.order_id, key: rzp.key_id })
    }else{
      let item = result.items[0]

      order.payment_id = item.id
      if(item.captured){
        order.status = "SUCCESSFUL"
        req.user.isPremiumUser = true
        await req.user.save();
        const token = jwt.sign({id : req.user.id , isPremiumUser : true} , "ff1234ff123")
        await order.save()
        return res.json({ success: true, msg: "payment complete", token ,isPremiumUser : true})
      }else{
        
        await order.save()
        order.status = "FAILED"
        return res.json({ success: false, msg: "payment failed",isPremiumUser : false })

      }

    }


  } catch (e) {
    console.log(e)
    return res.status(500).json({ msg: "Internal server error" })


  }


}



exports.successfullTransaction = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const orders = await req.user.getOrders({ where: { status: "PENDING" } });

    const payment_id = req.body.payment_id;
    const signature = req.body.razorpay_signature
    if (orders.length > 0) {
      const order = orders[0]
      const data = `${order.order_id}|${payment_id}`
      const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(data).digest('hex');

      if (generated_signature == signature) {
        const payment = await rzp.payments.fetch(payment_id);
        // const purchase = await Order.find
        if (payment.status == "captured") {
          // order.payment_id = payment_id;
          // order.status = "SUCCESSFUL"
          await order.update({payment_id :payment_id , status : "SUCCESSFUL"},{
            transaction : t
          })
          // await order.save()
          // req.user.isPremiumUser = true
          await req.user.update({isPremiumUser : true} , {
            transaction:t
          })
          const token = jwt.sign({id : req.user.id , isPremiumUser : true} , "ff1234ff123")
          await t.commit()
          return res.json({ success: true, msg: "payment complete", token ,isPremiumUser : true})
        } else {
          order.payment_id = payment_id;
          order.status = "FAILED"
          await order.save()

          return res.json({ success: false, msg: "payment failed",isPremiumUser : false })

        }

      } else {
        return res.status(401).json({ msg: "not authorized" })

      }

    } else {
      return res.status(403).json({ msg: "no order found" })

    }

  } catch (e) {
    console.log(e)
    await t.rollback()
    console.log("rollback")
    return res.status(500).json({ msg: "Internal server error" })
  }
}


exports.failedTransaction = async (req, res) => {
  try {
    const orders = await req.user.getOrders({ where: { status: "PENDING" } });
    // return res.json(orders)
    if (orders.length > 0) {
      const order = orders[0]
      const payment_id = req.body.payment_id;
      const payment = await rzp.payments.fetch(payment_id)
      // return res.json(payment)
      if (payment.status == "failed") {

        order.status = "FAILED"
        order.payment_id = payment_id
        await order.save()
        return res.json({ success: false, msg: "transaction failed",isPremiumUser : false })
      }
    } else {
      return res.status(403).json({ msg: "no order found" })

    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({ msg: "Internal server error" })
  }
}


// exports.handleExternal = async(req,res)=>{
//   try{
//     const orders = await req.user.getOrders({where : {status : "PENDING"}});
//     if(orders.length > 0){
//       const order = orders[0]
//       const result = await rzp.orders.fetch(order.order_id)
//       console.log(result)
//       return res.json(result)
//     }else{
//       return res.status(404).json({success : false , msg : "No order found"})
//     }

//   }catch(e){
//     console.log(e)
//     return res.status(500).json({ msg: "Internal server error" })
//   }
// }