# 🧠 Smart Ticketing AI Agent System  

An intelligent AI-powered ticketing system built with **Node.js**, **Express.js**, **Inngest**, **Nodemailer**, and **Google AI** APIs.  
This system automatically assigns tickets, suggests helpful notes, matches skills, and updates ticket status.  

---

## 🚀 Features  

- ✅ **User Authentication & Authorization**  
- ✅ **AI Agent Assignment using Google AI API**  
- ✅ **Skill Matching & Ticket Assignment to Moderators**  
- ✅ **Helpful Notes Generation with AI**  
- ✅ **Auto Status Update for Tickets**  
- ✅ **Email Notifications using Nodemailer**  
- ✅ **Background Jobs Handling with Inngest**  
- ✅ **Clean RESTful API with Express.js**  
- ✅ **Modular Code Structure (Backend + Frontend)**  

---

## 🛠️ Tech Stack  

- **Backend:** Node.js, Express.js  
- **AI Integration:** Google AI Studio (Gemini API)  
- **Background Jobs:** Inngest  
- **Email Service:** Nodemailer  
- **Database:** (Add your DB here, e.g. MongoDB)  
- **Frontend:** (Optional — your frontend tech)  

---

## 📂 Project Folder Structure  

```
ChatBot
├── BACKEND
│ ├── controllers
│ ├── middlewares
│ ├── models
│ ├── routes
│ ├── utils
│ ├── inngest # Inngest background handlers
│ ├── .env
│ ├── .gitignore
│ ├── index.js # App Entry Point
│ ├── package.json
├── FRONTEND
```
---

---

## ⚙️ How AI Agent Works  

1️⃣ User creates a ticket  
2️⃣ AI Agent reads the ticket & analyzes it via Google AI API  
3️⃣ Suggests **Helpful Notes**  
4️⃣ Matches **Relevant Skills** with Moderators  
5️⃣ Auto assigns the ticket to best-fit Moderator  
6️⃣ Updates ticket **Status**  
7️⃣ Sends notification emails via **Nodemailer**  
8️⃣ Runs async jobs using **Inngest**  

---

## 📝 How to Setup Locally  

1️⃣ Clone the repo  
```
git clone https://github.com/rajveer-09/Smart-Ticketing-AI-Agent.git
cd Smart-Ticketing-AI-Agent/BACKEND
```

## 2️⃣ Install Backend Dependencies
```
npm install
```
## 3️⃣ Configure Environment Variables
Create a .env file inside BACKEND/ and add:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_google_ai_api_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```
✅ Make sure .env is added in .gitignore

## 4️⃣ Run the Server
```
npm start
Server runs at ➔ http://localhost:5000/

```

## 📨 Email Notifications via Nodemailer
```
Configure SMTP settings in .env
```

Emails sent on ticket assignment, status update

## 🕒 Background Jobs with Inngest
- Used for async tasks like:
- Auto assignment
- Status updates
- AI processing
- Event-driven handlers inside inngest/

## 🤖 AI Integration
- Google Gemini AI used for:
- Summarizing tickets
- Generating helpful notes
- Skill recommendations
- Get your API key here

## 📝 Deployment Guide (Optional)
Use platforms like Render, Railway, Vercel, or Heroku
Add environment variables to their dashboard
Don't forget to keep .env safe

## 🤝 Contributing
- Fork the repository
- Create a feature branch
- Raise a Pull Request

## ✨ Author
Rajveer Sharma
GitHub • LinkedIn

## 📜 License
MIT License

## 🙌 Special Thanks
- Inngest for event-driven jobs
- Google AI Studio for AI integration
- Nodemailer for email services

