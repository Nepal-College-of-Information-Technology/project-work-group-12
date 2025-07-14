#  Cloud Application and Development Foundation  
## Course Project: Smart Restaurant Web Application  

 *Department of Software Engineering*  
 *Nepal College of Information Technology (NCIT)*  
 *Department of Software Engineering*

## 🧑‍🤝‍🧑 Team Members  
### Group Number: project-work-group-12
| Name            | Roll Number | Role               |
|-----------------|-------------|--------------------|
| Madhu kunwar    | 221721       | Frontend, Backend |
|Kausal Shah      | 221716       | Backend Dev       |
|Priya Shilpakar  | 221633       | Frontend          |

## 📌 Project Abstract

Our project focuses on digitizing the restaurant/café experience using cloud-native technologies. Customers can scan a QR code on their table to:

- Connect to the restaurant’s WiFi
- Access a dynamic menu
- Place customized orders
- Track order status in real time

Waiters and chefs are notified instantly via the app, improving operational efficiency and customer satisfaction.

This project highlights real-time data exchange, scalability, and minimal human interaction—key values in modern cloud systems.
---

## 🎯 Project Objectives

- Develop a responsive web application for customer check-in, menu access, and order placement  
- Implement real-time communication between customer, waiter, and kitchen staff  
- Use cloud services to host and scale the application  
- Ensure high availability, fault tolerance, and low latency  
- Integrate QR-based table identification and authentication

---
## System Architecture
- *Frontend*: React, TailwindCSS
- *Backend*: Node.js, Express
- *Database*: MongoDB
- *Realtime*: Socket.IO
- *Cloud*: AWS EC2/Lamba

---
## 🔧 Technologies & Tools Used
### ☁️ Cloud Platform
- Amazon Web Services (AWS)
### 💻 Programming Languages
- JavaScript / Python / Java / Node.js
### 🗄️ Databases
- MongoDB 
### 🛠️ Frameworks & Libraries
- React / Express.js / Flask
### 📦 DevOps & Deployment
- Docker

---

## 🚀 Implementation Highlights
-QR scan → menu & session start
-Real-time order updates via Socket.IO
-Kitchen & waiter dashboards
-MongoDB for flexible order data
-No login needed for customers
-Deployed on Vercel (frontend) & Render (backend)

---
## 🌌 Testing & Validation
-Unit tested APIs with Postman
-Tested frontend-backend flow manually
-Simulated load with Artillery
-Basic input validation and auth checks

---
## 📊 Results & Performance
| Metric                  | Result                 |
| ----------------------- | ---------------------- |
| Average API Response    | \~120 ms               |
| Concurrent Users Tested | 100+ simultaneous      |
| Uptime                  | 99.9%                  |
| Cost Efficiency         | Low; uses auto-scaling |

## 📷 Screenshots / UI Preview

---
## 🔧 Configuration
Add these to your .env file:
ini
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tabletap
JWT_SECRET=your_jwt_secret_here

---
## 🌐 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/tables | GET | List all tables |
| /api/orders | POST | Create new order |

---
# Start backend
cd backend
npm install
npm start

---
# Start frontend
cd ../frontend
npm install
npm run dev

---
## 📁 Repository Structure
tabletap/
├── backend/
│   ├── controllers/
│   ├── models/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
├── mobile/ (waiter app)
└── README.md

---
## 📈 Future Enhancements
-Add multilingual support for international customers
-Implement mobile app using React Native
-Add AI for order recommendations
-Enable online table booking
-Push notifications for food ready alerts

---
## 🙏 Acknowledgments
-Our mentors at NCIT
-Pokhara University for course structure
-FastAPI, MongoDB, Tailwind, and React communities
-Contributors of open-source libraries we used

---
# 📚 References
-FastAPI Docs
-React Docs
-MongoDB Atlas
-qrcode.react
-Render Deployment

---
## 🧾 License