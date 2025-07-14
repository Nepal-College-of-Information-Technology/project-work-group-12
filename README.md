# 🌩️ Cloud Application and Development Foundation  
## Course Project: Smart Restaurant Web Application  

> *Department of Software Engineering*  
> *Nepal College of Information Technology (NCIT)*  
> *Pokhara University*

---
## 🧑‍🤝‍🧑 Team Members  
### Group Number: project-work-group-12

| Name           | Roll Number | Role              |
|----------------|-------------|-------------------|
| Madhu Kunwar   | 221721      | Frontend, Backend |
| Kausal Shah    | 221716      | Backend Dev       |
| Priya Shilpakar| 221633      | Frontend          |


---
## 📌 Project Abstract

> Our project focuses on digitizing the restaurant/café experience using cloud-native technologies. Customers can scan a QR code on their table to:  
> - Connect to the restaurant’s WiFi  
> - Access a dynamic menu  
> - Place customized orders  
> - Track order status in real time  

Waiters and chefs are notified instantly via the app, improving operational efficiency and customer satisfaction.

This project highlights real-time data exchange, scalability, and minimal human interaction — key values in modern cloud systems.

---

## 🎯 Project Objectives

> - Develop a responsive web application for customer check-in, menu access, and order placement.  
> - Implement real-time communication between customer, waiter, and kitchen staff.  
> - Use cloud services to host and scale the application.  
> - Ensure high availability, fault tolerance, and low latency.  
> - Integrate QR-based table identification and authentication.


---
## 🏗️ System Architecture

- *Frontend*: React, TailwindCSS  
- *Backend*: Node.js, Express  
- *Database*: MongoDB  
- *Realtime*: Socket.IO  
- *Cloud*: AWS EC2 / Lambda

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

- QR scan → menu & session start  
- Real-time order updates via Socket.IO  
- Kitchen & waiter dashboards  
- MongoDB for flexible order data  
- No login needed for customers  
- Deployed on Vercel (frontend) & Render (backend)  

---
## 🌌 Testing & Validation

- Unit tested APIs with Postman  
- Tested frontend-backend flow manually  
- Simulated load with Artillery  
- Basic input validation and authentication checks  

---
## 📊 Results & Performance

| Metric                  | Result                 |
| ----------------------- | ---------------------- |
| Average API Response    | ~120 ms               |
| Concurrent Users Tested | 100+ simultaneous      |
| Uptime                  | 99.9%                  |
| Cost Efficiency         | Low; uses auto-scaling |

---
## 📷 Screenshots / UI Preview

> 📸 **"A picture is worth a thousand words."**  
> The following screenshots give a visual walkthrough of the TableTap system — from customer check-in via QR to real-time order handling by kitchen and waitstaff.

### 🧭 QR Landing Page  


### 🍽️ Menu View  


### Order summary/cart


### Waiter notification page

...

---
## 🔧 Configuration

Create a `.env` file in the project root and add the following:

```ini
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tabletap
JWT_SECRET=your_jwt_secret_here

---
## 🌐 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/tables | GET | List all tables |
| /api/orders | POST | Create new order |

---
## ▶️ Start Backend

```bash
cd backend
npm install
npm start

---
## ▶️ Start Frontend

```bash
cd frontend
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

- Add multilingual support  
- Implement mobile app  
- AI for order recommendations  
- Online table booking  
- Push notifications  


---
## 🙏 Acknowledgments

- Our mentors at NCIT  
- Pokhara University for course structure  
- FastAPI, MongoDB, Tailwind, and React communities  
- Contributors of open-source libraries we used  


---
## 📚 References

- [FastAPI Docs](https://fastapi.tiangolo.com/)  
- [React Docs](https://reactjs.org/docs/getting-started.html)  
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)  
- [qrcode.react GitHub](https://github.com/zpao/qrcode.react)  
- [Render Deployment](https://render.com/docs)  


---
## 🧾 License