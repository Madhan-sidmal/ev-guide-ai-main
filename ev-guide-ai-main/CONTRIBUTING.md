# Contributing to EV Guide AI

Thank you for your interest in contributing to EV Guide AI! This document provides guidelines and information about contributing.

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature or fix
4. **Make your changes**
5. **Test** your changes
6. **Submit a pull request**

## 📋 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ev-guide-ai.git
cd ev-guide-ai

# Install dependencies
npm install --legacy-peer-deps
cd server && npm install && cd ..

# Copy env files
cp .env.example .env
cp server/.env.example server/.env

# Start development servers
# Terminal 1:
cd server && node index.js
# Terminal 2:
npm run dev
```

## 🏗️ Project Structure

- `src/` — React frontend (TypeScript)
- `server/` — Express backend (JavaScript)
- `src/components/` — Reusable UI components
- `src/pages/` — Page-level components
- `server/routes/` — API route handlers
- `server/services/` — Business logic (learning engine)

## 📝 Coding Standards

### Frontend (TypeScript/React)
- Use functional components with hooks
- Use TypeScript types/interfaces for all props and state
- Follow the existing component patterns
- Use Tailwind CSS for styling (no inline styles)
- Use Zustand for state management

### Backend (JavaScript/Node.js)
- Use async/await for asynchronous operations
- Handle errors with try/catch in all route handlers
- Use parameterized queries for SQL (never string concat)
- Return consistent JSON response formats

### General
- Write descriptive commit messages
- Keep functions small and focused
- Add comments for complex logic
- No console.log in production code (use proper logging)

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Test backend endpoints
# Start server, then use curl/Postman
curl http://localhost:3001/api/health
```

## 🔀 Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring

## 📬 Pull Request Process

1. Update the README.md if you've added new features
2. Ensure your code follows the existing style
3. Test all affected functionality
4. Write a clear PR description explaining your changes
5. Link any related issues

## 🐛 Reporting Bugs

Open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

## 💡 Feature Requests

Open an issue with:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (if any)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
