<div align="center">
  <h1 align="center">Minimal JWT Authentication</h1>
  <p align="center">
    A premium, full-stack JWT authentication system with role-based access control and modern glassmorphism UI.
  </p>
</div>

## ✨ Features

- **JWT Authentication:** Secure user sessions using JSON Web Tokens.
- **Role-Based Access Control:** 
  - Standard User dashboard with secure session data and personalized UI.
  - Administrator dashboard with a full user management table.
  - *Note: The first registered user is automatically assigned the `admin` role.*
- **Premium User Interface:**
  - Modern, responsive React frontend.
  - Sophisticated glassmorphism components (`backdrop-filter`).
  - Interactive grid background that smoothly illuminates following your mouse cursor.
  - Premium typography, glowing accents, and subtle CSS micro-animations.
- **Full-Stack Architecture:**
  - **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Motion (Framer Motion).
  - **Backend:** Express.js API handling secure endpoints.
  - **Database:** SQLite (`better-sqlite3`) for lightweight, persistent data storage.
  - **Security:** `bcryptjs` for robust password hashing.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jaggureddy11/JWT.git
   cd JWT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and ensure you have a secure JWT secret:
   ```env
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The backend server and React frontend will spin up concurrently using `tsx`. You can access the application at `http://localhost:3000`.

## 📂 Project Structure

- `src/` - React frontend codebase.
  - `components/` - Reusable UI elements (Buttons, Inputs, Interactive Backgrounds).
  - `pages/` - Main route views (Login, Signup, Dashboard).
  - `context/` - Auth context for global authentication state management.
- `server.ts` - Express backend server and SQLite database initialization logic.
- `database.sqlite` - The local SQLite database file (auto-generated upon running).

## 🔒 Security Notes

- Passwords are never stored in plain text. They are securely hashed using `bcryptjs` before being saved to the SQLite database.
- The JWT is used as a Bearer token in the `Authorization` header to secure protected API routes.

## 📝 License

This project is open-source and available under the MIT License.
