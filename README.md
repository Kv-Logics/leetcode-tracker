# 🎯 LeetCode Progress Tracker - Your Ultimate Coding Interview Companion

<div align="center">

### Track • Organize • Master Your LeetCode Journey

**A powerful, feature-rich web application designed to help developers systematically prepare for coding interviews by tracking problems across companies, organizing solutions, and monitoring progress—all in one beautiful interface.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

[Live Demo](#) • [Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-usage-guide)

</div>

---

## 🌟 Why This Tracker?

Preparing for technical interviews? Tired of scattered notes, lost code snippets, and forgetting which problems you've solved? This tracker is built by developers, for developers who want to:

- ✅ **Stay Organized** - Track problems from multiple companies in one place
- 📝 **Never Lose Solutions** - Store your code and notes for every problem
- 📊 **Visualize Progress** - See your completion rate with beautiful charts
- 🎯 **Focus Your Prep** - Create custom problem sets and bookmarks
- 🤝 **Collaborate** - Share your progress with friends or study groups
- 🚀 **Interview Ready** - Quick access to all your solutions before interviews

## ✨ Complete Feature Set

### 🏢 Company-Wise Problem Tracking
- **Multi-Company Support** - Track problems from Google, Amazon, Meta, Microsoft, and more
- **CSV Upload** - Import entire company problem sets with one click
- **Smart Sidebar Navigation** - Quickly switch between companies
- **Progress Visualization** - Circular progress charts showing completion percentage
- **Difficulty Filters** - Filter by Easy, Medium, or Hard problems
- **Search Functionality** - Find problems instantly by title or ID

### 📚 Custom Problem Sheets
- **Create Your Own Lists** - Build personalized problem collections
- **Quick Add While Solving** - Add problems on-the-fly while practicing on LeetCode
- **Categorize by Topics** - Organize by Arrays, Strings, DP, Trees, etc.
- **Link to LeetCode** - Direct links to original problems
- **Track Completion** - Mark problems as solved with satisfying checkboxes

### 💻 Code & Notes Management
- **Multi-Language Support** - Store solutions in JavaScript, Python, Java, C++, Go, Rust
- **Rich Note Taking** - Document your approach, time complexity, and key insights
- **Version History** - Keep multiple solutions per problem
- **Syntax Highlighting** - Clean, readable code display
- **Quick Access** - One-click access to all your notes and code

### ⭐ Smart Bookmarking System
- **Create Collections** - Organize problems into themed bookmarks
- **One-Click Bookmarking** - Star icon on every problem
- **Multiple Bookmarks** - Add same problem to different collections
- **Visual Indicators** - See which problems are bookmarked at a glance

### 🔐 Secure Authentication & Roles
- **JWT Authentication** - Industry-standard secure login
- **User Accounts** - Personal progress tracking for each user
- **Admin Dashboard** - Manage users and companies (for team leads)
- **Role-Based Access** - Admin and user roles with different permissions

### 📊 Progress Analytics
- **Completion Tracking** - See how many problems you've solved
- **Visual Progress Bars** - Beautiful circular charts
- **Per-Company Stats** - Track progress for each company separately
- **Custom Sheet Progress** - Monitor your personal problem sets

### 🎨 Beautiful User Interface
- **Modern Dark Theme** - Eye-friendly gradient design
- **Smooth Animations** - Delightful hover effects and transitions
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Intuitive Navigation** - Everything is just one click away
- **Clean Typography** - Easy to read, professional appearance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works great)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Kv-Logics/leetcode-tracker.git
cd leetcode-tracker
npm install
```

### 2. Set Up Database
1. Create a [Supabase](https://supabase.com) project
2. Go to SQL Editor
3. Copy and run `SETUP_DATABASE.sql`
4. Get your API credentials from Project Settings → API

### 3. Configure Environment
Create `.env.local`:
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

**Default Login:** `admin` / `admin123` (change immediately!)

## 📖 Usage Guide

### For Individual Developers

**1. Track Company Problems**
- Upload CSV files with company-specific problems
- Mark problems as solved while practicing
- Search and filter to find specific problems
- View your progress with visual charts

**2. Create Custom Sheets**
- Click "📚 My Custom Sheet" in sidebar
- Add problems you're currently working on
- Categorize by topic (Arrays, DP, etc.)
- Track completion separately from company sheets

**3. Store Solutions**
- Click 📝 icon on any problem
- Write notes about your approach
- Paste your code solution
- Save in multiple programming languages
- Access anytime before interviews

**4. Organize with Bookmarks**
- Click ★ icon to bookmark problems
- Create collections like "Review Before Interview"
- Add problems to multiple bookmarks
- Quick access to important problems

### For Study Groups

**1. Admin Setup**
- One person creates admin account
- Upload company problem sets
- Share login with group members

**2. Individual Tracking**
- Each member creates their own account
- Track personal progress independently
- Share solutions and notes
- Compare completion rates

### For Interview Prep

**1. Before Interview**
- Review bookmarked problems
- Check your notes and solutions
- Filter by company name
- Practice problems you haven't solved

**2. After Solving**
- Mark problem as complete
- Add your solution and notes
- Bookmark for future review
- Track your improvement

## 🎯 Perfect For

- 🎓 **Students** preparing for campus placements
- 💼 **Job Seekers** targeting specific companies
- 🔄 **Career Switchers** learning data structures
- 👥 **Study Groups** tracking collective progress
- 🏢 **Bootcamp Students** organizing coursework
- 📈 **Anyone** serious about coding interviews

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with bcrypt
- **Styling**: Inline CSS (zero dependencies)
- **Deployment**: Vercel (one-click deploy)

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done!)
2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `Kv-Logics/leetcode-tracker`
3. **Add Environment Variables**:
   ```
   JWT_SECRET=<generate-random-32-char-string>
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
4. **Deploy** - Takes 2-3 minutes
5. **Done!** Your tracker is live 🚀

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🎬 How It Works

```
1. Sign Up → Create your account
2. Upload CSV → Import company problems or create custom sheets
3. Start Solving → Mark problems as you complete them
4. Add Notes → Store your solutions and approaches
5. Bookmark → Save important problems for review
6. Track Progress → Watch your completion rate grow
7. Interview Ready → Access all your prep in one place
```

## 🤝 Contributing

We love contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI enhancements

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

**TL;DR**: Free to use, modify, and distribute. Just keep the license notice.

## 🙏 Acknowledgments

- **LeetCode** for the amazing platform
- **Supabase** for the powerful backend
- **Next.js** team for the fantastic framework
- **You** for using this tracker!

## 💬 Support & Community

- 🐛 **Found a bug?** [Open an issue](https://github.com/Kv-Logics/leetcode-tracker/issues)
- 💡 **Have an idea?** [Start a discussion](https://github.com/Kv-Logics/leetcode-tracker/discussions)
- ⭐ **Like this project?** Give it a star!
- 🔗 **Share** with friends preparing for interviews

## 🗺️ Roadmap

- [ ] Export progress to PDF/CSV
- [ ] Dark/Light theme toggle
- [ ] Problem difficulty statistics
- [ ] Time tracking per problem
- [ ] Social features (share progress)
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] AI-powered problem recommendations
- [ ] Spaced repetition reminders
- [ ] Interview scheduling integration

## 📊 Project Stats

- **42 Files** of clean, documented code
- **4,810 Lines** of TypeScript/React
- **8 Database Tables** for complete functionality
- **100% Free** and open source
- **0 External CSS** dependencies

---

<div align="center">

### 🚀 Start Tracking Your Progress Today!

**Made with ❤️ by developers, for developers**

[Get Started](#-quick-start) • [View Demo](#) • [Report Bug](https://github.com/Kv-Logics/leetcode-tracker/issues)

⭐ **Star this repo** if it helps your interview prep!

</div>

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
