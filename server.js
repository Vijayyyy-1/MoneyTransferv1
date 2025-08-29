// ==== IMPORTS ====
const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ==== APP SETUP ====
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// Hardcoded login
// const USERNAME = "Shivam";
// const PASSWORD = "Shivam1234";
// Hardcoded shop owners
// const SHOP_OWNERS = [
//   { username: "Shivam", password: "Shivam1234" },
//   { username: "Vijay", password: "Vijay73788" },
// ];
const ownerSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // plaintext for now, ideally hash it with bcrypt
});

const Owner = mongoose.model("Owner", ownerSchema);


app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("📝 Login attempt:", { username, password });

  try {
    const owner = await Owner.findOne({ username: username.trim() });

    if (!owner) {
      console.log("❌ Invalid login for:", username);
      return res.json({ success: false, message: "Invalid username or password!" });
    }

    if (owner.password !== password.trim()) {
      console.log("❌ Invalid login for:", username);
      return res.json({ success: false, message: "Invalid username or password!" });
    }

    console.log("✅ Login successful for:", owner.username);
    res.json({ success: true, owner: owner.username });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ==== CONNECT TO MONGO ATLAS ====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ==== DEFINE SCHEMAS & MODELS ====
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  whatsapp: String,
  owner: String, // shop owner
});

const transactionSchema = new mongoose.Schema({
  user: String, // user email
  type: String, // "in" or "out"
  amount: Number,
  date: { type: Date, default: Date.now },
  owner: String, // shop owner
});

const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// ==== EMAIL TRANSPORT ====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==== EMAIL TEMPLATES ====

// Welcome Email
const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f8f9fa; margin:0; padding:0; }
    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:8px; 
                 overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);}
    .header { background:#198754; color:#fff; padding:16px; text-align:center; font-size:20px; }
    .content { padding:20px; color:#333; }
    .footer { text-align:center; padding:15px; font-size:13px; color:#777; background:#f1f1f1;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">🎉 Welcome to Money Transfer Tracker</div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your account has been created successfully! You can now start recording and tracking your transactions.</p>
      <p>✅ Thank you for joining us!</p>
    </div>
    <div class="footer">This is an automated message. Please do not reply.</div>
  </div>
</body>
</html>
`;

// Transaction Email
const transactionTemplate = (name, type, amount, date, summary) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transaction Alert</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f8f9fa; margin:0; padding:0; }
    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:8px; 
                 overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);}
    .header { background:#0d6efd; color:#fff; padding:16px; text-align:center; font-size:20px; }
    .content { padding:20px; color:#333; }
    .transaction { border:1px solid #ddd; padding:15px; border-radius:6px; background:#fafafa; margin-bottom:20px;}
    .transaction strong { color:#0d6efd; }
    .summary-cards { display:flex; gap:10px; margin-top:15px; }
    .card { flex:1; padding:15px; border-radius:8px; color:#fff; text-align:center; }
    .received { background:#28a745; }
    .sent { background:#dc3545; }
    .balance { background:#0d6efd; }
    .card h4 { margin:0 0 8px 0; font-size:14px; font-weight:normal; }
    .card p { margin:0; font-size:18px; font-weight:bold; }
    .footer { text-align:center; padding:15px; font-size:13px; color:#777; background:#f1f1f1;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">💸 Money Transfer Tracker</div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>A new transaction was recorded:</p>

      <div class="transaction">
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      </div>

      <h3>📊 Account Summary</h3>
      <div class="summary-cards">
        <div class="card received">
          <h4>Total Received</h4>
          <p>₹${summary.in}</p>
        </div>
        <div class="card sent">
          <h4>Total Sent</h4>
          <p>₹${summary.out}</p>
        </div>
        <div class="card balance">
          <h4>Balance</h4>
          <p>₹${summary.balance}</p>
        </div>
      </div>

      <p style="margin-top:20px;">✅ Thank you for using <strong>Money Transfer Tracker</strong>.</p>
    </div>
    <div class="footer">This is an automated message. Please do not reply.</div>
  </div>
</body>
</html>
`;

// helper function
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Money Transfer Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent to", to);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

// ==== API ENDPOINTS ====

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({owner:req.query.owner});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new user
app.post("/users", async (req, res) => {
  try {
    const { name, email, whatsapp } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    const newUser = new User({ name, email, whatsapp,owner:req.body.owner });
    await newUser.save();

    // send welcome email
    await sendEmail(
      email,
      "Welcome to Money Transfer App 🎉",
      welcomeTemplate(name)
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all transactions
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find({owner:req.query.owner});
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Signup route for new shop owners
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingOwner = await Owner.findOne({ username: username.trim() });
    if (existingOwner) {
      return res
        .status(409)
        .json({ success: false, message: "Username already exists" });
    }

    // Create new owner
    const newOwner = new Owner({ username: username.trim(), password: password.trim() });
    await newOwner.save();

    res.status(201).json({ success: true, message: "Owner registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Add a new transaction
app.post("/transactions", async (req, res) => {
  try {
    const { user: userEmail, type, amount } = req.body;

    // check user exists
    const foundUser = await User.findOne({ email: userEmail });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // save transaction
    const newTransaction = new Transaction({
      user: userEmail,
      type,
      amount,
      owner: req.body.owner,
    });
    await newTransaction.save();

    // fetch all transactions for this user
    const allTransactions = await Transaction.find({ user: userEmail });

    console.log("📊 Transactions fetched for:", userEmail);
    console.log(allTransactions);

    let totalIn = 0,
      totalOut = 0;

    allTransactions.forEach((tx) => {
      const t = tx.type.trim().toLowerCase(); // normalize
      if (t === "in") {
        totalIn += tx.amount;
      } else if (t === "out") {
        totalOut += tx.amount;
      }
    });

    const balance = totalIn - totalOut;

    console.log("📊 Summary Calculated:", { totalIn, totalOut, balance });

    const summary = { in: totalIn, out: totalOut, balance };

    // Map transaction type to friendly label
    const typeLabel =
      type.toLowerCase() === "in" ? "Money Received" : "Money Sent";

    // build email template
    const html = transactionTemplate(
      foundUser.name,
      typeLabel,
      amount,
      newTransaction.date,
      summary
    );

    await sendEmail(userEmail, "Transaction Alert + Account Summary", html);

    res.status(201).json({ message: "Transaction recorded & email sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user + their transactions
app.delete("/users/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await Transaction.deleteMany({ user: email });

    res
      .status(200)
      .json({ message: "User and transactions deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "loginPage.html"));
});
// ==== STATIC FILES ====
app.use(express.static(path.join(__dirname, "public")));


// ==== START SERVER ====
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🌐 Try http://192.168.56.1:${port} from another device`);
});