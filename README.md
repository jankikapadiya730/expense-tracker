# 🧾 SplitSphere — Group Expense Splitter

SplitSphere is a modern, high-end group expense splitting application built with **Django REST Framework** and **React**. It helps friend groups, roommates, and travel partners track shared expenses, split bills fairly, and settle debts with smart automation and premium design.

---

## ✨ Features

### 🚀 Core Features
- **User Authentication**: Secure JWT-based authentication with user profiles.
- **Group Management**: Create groups, join via unique invite codes, and manage roles.
- **Expense Tracking**: Add expenses with categories, receipts, and flexible splitting.
- **Smart Splitting**: Support for **Equal**, **Exact Amount**, **Percentage**, and **Shares** splitting.
- **Balances & Settlements**: Real-time balance calculation and official debt settlement tracking.

### 🧠 Advanced Automation
- **OCR Bill Scanning**: Integrated **Tesseract.js** to auto-extract amounts and merchants from receipt images.
- **Multi-Currency Support**: Add expenses in any currency (USD, EUR, GBP, etc.) with automatic conversion to the group's base currency.
- **Smart Reminders**: One-click reminders to group members who owe money via an internal notification system.
- **Recurring Expenses**: Logic to handle monthly rent, weekly subscriptions, or daily bills automatically.

### 📊 Reports & Insights
- **Visual Analytics**: Interactive charts (Category breakdown, Spending trends) using **Recharts**.
- **Data Export**: One-click **PDF** reports and **Excel** data exports for any group.

### 📱 Premium UX/UI
- **Glassmorphism Design**: A stunning, modern dark-first UI with depth, blur, and vibrant accents.
- **Mobile First**: PWA support (installable on mobile) with a specialized bottom navigation bar.
- **Micro-Animations**: Smooth transitions and staggered entries powered by **Framer Motion**.

---

## 🛠️ Tech Stack

- **Backend**: Python, Django, DRF, SQLite (PostgreSQL compatible)
- **Frontend**: React (Vite), TailwindCSS, Recharts, Framer Motion, Zustand
- **Auth**: SimpleJWT
- **State Management**: React Query (Server state), Zustand (Global/Auth state)
- **OCR**: Tesseract.js

---

## 🚦 Getting Started

### Backend Setup
1. Navigate to `backend/`
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # venv\Scripts\activate on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

Built with ❤️ by the **SplitSphere** Team.
