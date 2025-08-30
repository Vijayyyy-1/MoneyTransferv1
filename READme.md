# Money Transfer Tracker

A web application for shop owners to manage customers and track money transfer transactions with email and WhatsApp notifications.

---

## Features

- Shop owner registration and login
- Customer registration (with WhatsApp number)
- Record "Send" and "Receive" transactions
- Dashboard for users and transactions
- Email notifications for registration and transactions
- WhatsApp notification links
- Day and Night UI modes
- Responsive design (Bootstrap/Tailwind)
- MongoDB Atlas integration

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Installation

1. **Clone the repository**

   ```sh
   git clone <repo-url>
   cd Money-Transfer
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   PORT=3000
   ```

4. **Start the server**
   ```sh
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
Money-Transfer/
│   .env
│   .gitignore
│   index_backup.html
│   package.json
│   server.js
└───public/
    │   index.html
    │   index_night.html
    │   loginPage.html
    │   loginPage1.html
    │   register.html
    │   register_night.html
    │   signup.html
    │   user.html
```

---

## Usage

- Register as a shop owner and log in.
- Add customers with their email and WhatsApp number.
- Record transactions (send/receive) for each customer.
- Customers receive email notifications automatically.
- Use the dashboard to view and manage users and transactions.

---

## License

See [package.json](./package.json) for license information.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## Support

For questions or support, please contact the repository maintainer.
