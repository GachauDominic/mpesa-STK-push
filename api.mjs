/*
  Author: Dominic Gachau
  Description: Mpesa Daraja API with Node JS
*/

import express from "express";
import axios from "axios";
import fs from "node:fs";
import moment from "moment";
import "dotenv/config";

const router = express.Router();

const CallBackURL = process.env.NGROK_CALLBACK_URL;

// Sample API route
router.get("/api/home", (req, res) => {
  res.json({ message: "This is a sample API route." });
  console.log("This is a sample API route.");
});

router.get("/api/access_token", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      res.json({ message: "😀 Your access token is " + accessToken });
    })
    .catch((error) => {
      console.error("Failed to get access token:", error.message);
      res.status(500).json({ message: "Failed to get access token" });
    });
});

async function getAccessToken() {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("Set CONSUMER_KEY and CONSUMER_SECRET in your .env file");
  }

  const url =
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth =
    "Basic " +
    Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");

  const response = await axios.get(url, {
    headers: {
      Authorization: auth,
    },
  });
  return response.data.access_token;
}

router.post("/api/stkpush", (req, res) => {
  let phoneNumber = req.body.phone;
  const accountNumber = req.body.accountNumber;
  const amount = req.body.amount;

  if (phoneNumber.startsWith("0")) {
    phoneNumber = "254" + phoneNumber.slice(1);
  }

  //ECHO  THE DATA THAT WE RECEIVED FROM THE CLIENT
  // console.log("Phone Number:", phoneNumber);
  // console.log("Account Number:", accountNumber);
  // console.log("Amount:", amount);
  // res.json({ message: 'This is a sample API route.' });

  getAccessToken()
    .then((accessToken) => {
      const url =
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      const auth = "Bearer " + accessToken;
      const timestamp = moment().format("YYYYMMDDHHmmss");
      const password = Buffer.from(
        "174379" +
          "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
          timestamp,
      ).toString("base64");

      axios
        .post(
          url,
          {
            BusinessShortCode: "174379",
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: "174379",
            PhoneNumber: phoneNumber,
            CallBackURL: CallBackURL,
            AccountReference: accountNumber,
            TransactionDesc: "Mpesa Daraja API stk push test",
          },
          {
            headers: {
              Authorization: auth,
            },
          },
        )
        .then((response) => {
          // res.send("😀 Request is successful done ✔✔. Please enter mpesa pin to complete the transaction");
          //SEND BACK A JSON RESPONSE TO THE CLIENT
          console.log(response.data);
          res.status(200).json({
            msg: "Request is successful done ✔✔. Please enter mpesa pin to complete the transaction",
            status: true,
          });
        })
        .catch((error) => {
          console.log(error);
          //res.status(500).send("❌ Request failed");
          console.log(error);
          res.status(500).json({
            msg: "Request failed",
            status: false,
          });
        });
    })
    .catch((error) => {
      console.error("Failed to get access token:", error.message);
      res.status(500).json({ msg: "Failed to get access token", status: false });
    });
});

router.post("/api/callback", (req, res) => {
  console.log("STK PUSH CALLBACK");
  const stkCallback = req.body?.Body?.stkCallback;
  if (!stkCallback) {
    return res.status(400).json({ message: "Invalid STK callback payload" });
  }

  const merchantRequestID = stkCallback.MerchantRequestID;
  const checkoutRequestID = stkCallback.CheckoutRequestID;
  const resultCode = stkCallback.ResultCode;
  const resultDesc = stkCallback.ResultDesc;
  const callbackMetadata = stkCallback.CallbackMetadata;
  const amount = callbackMetadata?.Item?.[0]?.Value;
  const mpesaReceiptNumber = callbackMetadata?.Item?.[1]?.Value;
  const transactionDate = callbackMetadata?.Item?.[3]?.Value;
  const phoneNumber = callbackMetadata?.Item?.[4]?.Value;

  console.log("MerchantRequestID:", merchantRequestID);
  console.log("CheckoutRequestID:", checkoutRequestID);
  console.log("ResultCode:", resultCode);
  console.log("ResultDesc:", resultDesc);

  console.log("Amount:", amount);
  console.log("MpesaReceiptNumber:", mpesaReceiptNumber);
  console.log("TransactionDate:", transactionDate);
  console.log("PhoneNumber:", phoneNumber);

  var json = JSON.stringify(req.body);
  fs.writeFile("stkcallback.json", json, "utf8", function (err) {
    if (err) {
      console.error("Failed to save STK callback:", err);
      return res.status(500).json({ message: "Failed to save callback" });
    }
    console.log("STK PUSH CALLBACK STORED SUCCESSFULLY");
    res.sendStatus(200);
  });
});

// Other API routes go here...

export default router;
