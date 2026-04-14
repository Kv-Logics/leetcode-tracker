# 🎯 LeetCode Company Tracker

A modern, full-stack web application for tracking LeetCode problems by company with JWT authentication, role-based access control, and personalized bookmarks.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Features

### Core Functionality
- 📊 **Multi-Company Support** - Track problems from multiple companies (PayPal, Google, Amazon, etc.)
- ✅ **Progress Tracking** - Mark problems as completed with persistent storage
- 🔍 **Smart Search & Filter** - Search by problem title/ID and filter by difficulty
- 📈 **Visual Progress** - Beautiful circular progress chart showing completion percentage
- ⭐ **Bookmarks** - Create custom bookmark collections to organize problems

### Authentication & Security
- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access** - Admin and user roles with different permissions
- 🛡️ **Row Level Security** - Supabase RLS policies for data protection

### Admin Features
- 👨‍💼 **User Management** - View and manage all users
- 🏢 **Company Management** - Add, view, and delete company problem sets
- 📊 **Progress Monitoring** - View any user's progress across companies
- 🗑️ **Data Management** - Delete users and companies (with safeguards)

### User Experience
- 🎨 **Modern Dark Theme** - Eye-protective gradient design
- 📱 **Responsive Layout** - Works on desktop, tablet, and mobile
- 🔄 **Collapsible Sidebar** - Clean navigation between companies
- 💾 **Auto-Save** - Progress saved automatically
- 🚀 **Fast & Smooth** - Optimized performance with Next.js 14

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works great)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/leetcode-tracker.git
cd leetcode-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### 4. Configure Environment Variables

Create `.env.local` in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set Up Database

Run these SQL commands in Supabase SQL Editor (in order):

**Step 1: Create tables**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  problems JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id, company_name)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#58a6ff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Bookmark items table
CREATE TABLE bookmark_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bookmark_id, problem_id, company_name)
);
```

**Step 2: Enable RLS**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for JWT-based auth)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all on user_progress" ON user_progress FOR ALL USING (true);
CREATE POLICY "Allow all on bookmarks" ON bookmarks FOR ALL USING (true);
CREATE POLICY "Allow all on bookmark_items" ON bookmark_items FOR ALL USING (true);
```

### 6. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Default Admin Account
- Username: `admin`
- Password: `admin123`

**⚠️ Change this immediately in production!**

## 📦 Deployment to Vercel

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/leetcode-tracker)

### Manual Deployment

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.**

Quick steps:
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables:
   - `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
4. Deploy!

**Important**: Run `SETUP_DATABASE.sql` in Supabase SQL Editor before first use.

## 📖 Usage Guide

### For Users

1. **Sign Up** - Create an account on the login page
2. **Browse Companies** - Use the sidebar to switch between companies
3. **Track Progress** - Check off problems as you complete them
4. **Search & Filter** - Find specific problems quickly
5. **Create Bookmarks** - Click the ★ icon to organize problems into collections

### For Admins

1. **Access Admin Panel** - Click the 🔐 Admin button in the navbar
2. **Manage Companies** - View all companies and their problem counts
3. **Manage Users** - View, monitor, and delete users
4. **Upload CSVs** - Add new company problem sets via CSV upload

### CSV Format for Upload

```csv
ID,URL,Title,Difficulty,Acceptance %,Frequency %
1,https://leetcode.com/problems/two-sum,Two Sum,Easy,56.6%,75.0%
3,https://leetcode.com/problems/longest-substring,Longest Substring,Medium,37.9%,62.5%
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with bcrypt
- **Styling**: Inline CSS (no dependencies)
- **Deployment**: Vercel

## 📁 Project Structure

```
leetcode-tracker/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── admin/        # Admin endpoints
│   │   ├── bookmarks/    # Bookmark management
│   │   ├── companies/    # Company management
│   │   └── problems/     # Problem tracking
│   ├── admin/            # Admin dashboard page
│   ├── upload/           # CSV upload page
│   ├── page.tsx          # Main app page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── auth.ts           # JWT utilities
│   ├── db.ts             # Database helpers
│   ├── problems.ts       # Problem types
│   └── supabase.ts       # Supabase client
├── public/
│   └── leetcode-icon.webp
└── README.md
```

## 🔒 Security Best Practices

1. **Change Default Credentials** - Update admin password immediately
2. **Use Strong JWT Secret** - Generate a secure random string
3. **Enable HTTPS** - Always use HTTPS in production (Vercel does this automatically)
4. **Regular Updates** - Keep dependencies updated
5. **Environment Variables** - Never commit `.env.local` to git

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write clean, readable code
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- LeetCode for the problem platform
- Supabase for the amazing backend infrastructure
- Next.js team for the fantastic framework
- All contributors and users of this project

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/leetcode-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/leetcode-tracker/discussions)

## 🗺️ Roadmap

- [ ] Dark/Light theme toggle
- [ ] Export progress to PDF
- [ ] Problem difficulty statistics
- [ ] Time tracking per problem
- [ ] Social features (share progress)
- [ ] Mobile app (React Native)
- [ ] Browser extension

---

Made with ❤️ by developers, for developers

⭐ Star this repo if you find it helpful!
