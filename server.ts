import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Initialize SQLite
  const dbPath = process.env.DATABASE_PATH || './database.sqlite';
  const db = new Database(dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.sendStatus(403);
    }
  };

  // API Routes
  
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Check if user exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      
      // Force first user to be admin for convenience in this demo, or allow specifying role if no users exist
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      const assignedRole = (userCount.count === 0) ? 'admin' : (role === 'admin' ? 'user' /* Prevent creating admins directly without auth */ : 'user');

      const result = db.prepare(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
      ).run(name, email, password_hash, assignedRole);
      
      const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ADMIN ROUTES
  app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, isAdmin, async (req: any, res) => {
    try {
      if (req.user.id.toString() === req.params.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
      }
      db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Fallback Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 5.x compatibility
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
