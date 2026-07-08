# Whispr — Real-Time Chat Application

> A production-ready full-stack real-time chat application built with Laravel 12 and React 19, deployed live on Railway.

🔗 **Live Demo:** [whispr-live.up.railway.app](https://whispr-live.up.railway.app)

---

## 📸 Preview

> Log in with the demo account to explore all features:
> - **Email:** `hamza@test.com`
> - **Password:** `password123`

---

## ✨ Features

### 💬 Messaging
- Real-time messaging with automatic polling (2-second sync)
- Private one-on-one conversations
- Group chats with roles (Owner / Admin / Member)
- Reply to specific messages with quoted preview
- Edit and delete sent messages
- Emoji reactions (hover on desktop, long press on mobile)
- Pin important messages to the top of the conversation
- Search messages inside any conversation

### 📎 Media & Files
- Image, video, audio and file attachments
- Cloud storage via **Cloudinary** (persistent across deployments)
- Avatar upload with automatic face-cropping
- Group photo upload and change

### 🔔 Notifications
- Browser push notifications for new messages
- Sound alert when a message arrives in another tab
- Unread message count shown in browser tab title
- Unread badges in conversation sidebar

### 👥 Groups
- Two-step group creation modal (select members → set details)
- Group photo upload
- Add / remove members (admin only)
- Promote members to admin (owner only)
- Leave group or delete group

### 🟢 Online Status
- Real-time online/offline indicator
- Auto-detects offline after 2 minutes of inactivity
- Last seen tracking

### 🛡️ Admin Dashboard
- Stats overview with message activity chart
- User management (ban, unban, make admin, delete)
- Message moderation (delete any message)
- Group management (delete any group)
- Accessible at `/admin` (admin role required)

### 📱 Responsive Design
- Fully mobile-responsive dark UI
- Mobile-first navigation (sidebar ↔ conversation toggle)
- Long-press context menu on mobile
- Touch-optimized controls

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 12, PHP 8.3 |
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Database** | MySQL (Railway) |
| **Cache** | Redis (Railway) |
| **Auth** | Laravel Sanctum (token-based) |
| **File Storage** | Cloudinary |
| **Deployment** | Railway (CI/CD via GitHub) |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |

---

## 🗄️ Database Schema

14 tables covering:
- `users` — auth, roles, online status, avatar
- `conversations` — private & group, pinned message
- `conversation_members` — membership with read tracking
- `messages` — body, type, reply threading, edit/delete flags
- `message_reactions` — emoji reactions per user
- `attachments` — file metadata + Cloudinary URLs
- `groups` — name, photo, owner, invite code
- `group_members` — roles (owner/admin/member)

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+
- MySQL
- Redis

### Installation

```bash
# Clone the repo
git clone https://github.com/hamzashahidchoudhary/Whispr.git
cd Whispr

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

### Environment Setup

Update `.env` with your credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=whispr
DB_USERNAME=root
DB_PASSWORD=

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SESSION_DRIVER=cookie
```

### Run the App

```bash
# Run migrations
php artisan migrate

# Start Laravel server
php artisan serve

# Start Vite dev server (new terminal)
npm run dev
```

Open [http://localhost:8000](http://localhost:8000)

---

## 📁 Project Structure

```
whispr/
├── app/
│   ├── Http/Controllers/Api/    # REST API controllers
│   ├── Models/                  # Eloquent models
│   └── Services/                # CloudinaryService
├── database/
│   └── migrations/              # 14 database migrations
├── resources/
│   └── js/
│       ├── components/          # React components
│       ├── contexts/            # Auth context
│       ├── hooks/               # useConversation, useNotifications
│       └── pages/               # Login, Register, Chat, Settings, Admin
└── routes/
    └── api.php                  # All API routes
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/register` | Register |
| `GET` | `/api/conversations` | List conversations |
| `POST` | `/api/conversations` | Start conversation |
| `GET` | `/api/conversations/:id/messages` | Get messages |
| `POST` | `/api/conversations/:id/messages` | Send message |
| `PUT` | `/api/messages/:id` | Edit message |
| `DELETE` | `/api/messages/:id` | Delete message |
| `POST` | `/api/messages/:id/react` | React to message |
| `POST` | `/api/messages/:id/pin` | Pin/unpin message |
| `POST` | `/api/groups` | Create group |
| `POST` | `/api/groups/:id/members` | Add member |
| `POST` | `/api/groups/:id/leave` | Leave group |
| `GET` | `/api/admin/stats` | Admin statistics |
| `POST` | `/api/admin/users/:id/ban` | Ban user |

---

## 🌐 Deployment

The app is deployed on **Railway** with:
- Automatic deploys from GitHub `main` branch
- MySQL and Redis as Railway services
- Cloudinary for persistent file storage
- HTTPS enforced via `AppServiceProvider`

---

## 👨‍💻 Author

**Muhammad Hamza**
- GitHub: [@hamzashahidchoudhary](https://github.com/hamzashahidchoudhary)
- LinkedIn: [Muhammad Hamza](https://linkedin.com/in/hamzashahidchoudhary)
- Portfolio: [Muhammad Hamza — Full Stack Developer](https://muhammadhamza-dev.vercel.app/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
