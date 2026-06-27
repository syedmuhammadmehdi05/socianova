# SociaNova 🚀

SociaNova is a full-stack social media web application built using **HTML, CSS, JavaScript (Frontend)**, **Node.js + Express (Backend)**, and **MongoDB (Database)**. It includes user authentication, post creation, and a modern social feed system.


## 🌐 Live Demo
Deployed on Railway: https://socianova-production.up.railway.app/


## ⚙️ Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs

### Database
- MongoDB (Mongoose)

### Deployment
- Docker
- Railway

---

## 📁 Project Structure
/backend
├── config/
│ └── db.js
├── routes/
│ ├── userRoutes.js
│ └── postRoutes.js
├── server.js
└── package.json

/frontend
├── index.html
├── register.html
├── css/
└── js/

/Dockerfile


---

## 🚀 Features

- User registration & login
- JWT-based authentication
- Password hashing using bcrypt
- Create and view posts
- REST API backend
- Static frontend served via Express
- MongoDB database integration
- Production deployment on Railway

---

## 🔧 Environment Variables

Create a `.env` file in `/backend`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=8080

🐳 Run with Docker
docker build -t socianova .
docker run -p 8080:8080 socianova

▶️ Run Locally
Backend
cd backend
npm install
npm start
Frontend

Open:
frontend/index.html

🧠 API Routes
Auth
POST /api/users/register
POST /api/users/login

Posts
GET /api/posts
POST /api/posts

🚀 Deployment Notes
Ensure MongoDB Atlas connection is active
Railway uses Dockerfile for deployment
App runs on process.env.PORT

⚠️ Known Behavior
MongoDB enforces unique usernames
Duplicate registration attempts will throw E11000 error
Frontend may briefly show error before redirect (handled in JS)
👨‍💻 Author

Built by Syed Muhammad Mehdi as a full-stack learning + deployment project.

📌 Future Improvements
Advanced Like/comment system
Profile page editing
Image uploads
Real-time chat (Socket.io)
Better UI framework integration


---

If you want next upgrade, I can also:

- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- or :contentReference[oaicite:2]{index=2}

Just tell me 👍