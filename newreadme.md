# 🎯 LeetCode Progress Tracker - Professional Interview Companion

<div align="center">

### Track • Automate • Master Your Coding Journey

**A production-grade web application built to streamline your technical interview preparation. Automate your problem tracking, organize your solutions with beautiful UI, and stay focused on what matters—mastering algorithms.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](#) • [Quick Start](#🚀-quick-start) • [Features](#✨-core-features) • [Deployment](#📦-one-click-deployment)

</div>

---

## 🚀 Why This Tracker?

The **LeetCode Progress Tracker** isn't just a list—it's a specialized productivity tool designed to remove the "data entry" friction from your interview prep.

- 🤖 **Zero-Effort Entry**: Enter a Problem ID, and we fetch the rest.
- 📂 **Consolidated Success**: Keep your notes, code, and links in one secure place.
- 📈 **Visual Mastery**: Track your completion percentage across target companies.
- ⚡ **Lightweight & Fast**: Powered by a native CSV engine—no heavy Excel dependencies.

---

## ✨ Core Features

### 🏢 Intelligent Company Tracking
*   **Bulk CSV Import**: Instantly import curated company-wise problem sets from sources like [leetcode-companywise-dsa](https://github.com/Kv-Logics/leetcode-companywise-dsa).
*   **Track Your Progress**: Upload a dataset, see the progress bars populate, and systematically check off problems as you solve them.
*   **Dynamic Search**: Instant filtering by problem ID or Title across thousands of entries.
*   **Progress Dashboard**: Circular progress indicators per company for motivation.


### 📚 Streamlined Custom Sheets
> [!IMPORTANT]
> **New Feature: Auto-Import by ID**
> You no longer need to copy-paste URLs or Titles. Simply enter the ID (e.g., `1`), and the app automatically fetches the official Title, Difficulty, and URL from our internal database.

*   **Personalized Progress**: Build your own "Must Do" lists.
*   **Quick Logging**: Add a problem in seconds while you're in the flow of solving.
*   **Topic Categorization**: Organize your custom sheets by DP, Trees, Strings, etc.

### 💻 Solution & Note Management
*   **Cross-Language Support**: Store solutions in JavaScript, Python, C++, and more.
*   **Note Taking**: Document your "Aha!" moments and time complexity analysis.
*   **Premium UI**: A GitHub-inspired dark theme with official LeetCode iconography.

---

## 🚀 Phase 2 Roadmap: AI Logic Agents
We are evolving the tracker from a recording tool into an **active learning companion**.

*   **Logic-First Guidance**: Soon, you'll be able to connect with **Specialized AI Agents** designed specifically for LeetCode mastery.
*   **Guide, Don't Code**: These agents won't just "give you the answer." Instead, they provide algorithmic hints, time-complexity analysis, and logical nudges to help you solve the problem yourself.
*   **Strategic Interview Prep**: The agent understands your progress and suggests logic patterns to learn next based on what you've already mastered.

---


## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Kv-Logics/leetcode-tracker.git
cd leetcode-tracker
npm install
```

### 2. Configure Your Database
Ensure you have a [Supabase](https://supabase.com) project ready. Run the `DATABASE_SCHEMA.sql` in your Supabase SQL editor to set up the tables.

### 3. Environment Setup
Create a `.env.local` file:
```env
JWT_SECRET=your_32_character_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development
```bash
npm run dev
```

---

## 🛠️ Tech Stack & Optimization

*   **Runtime**: Next.js 15 (App Router)
*   **Database**: Supabase / PostgreSQL
*   **Engine**: Custom Native CSV Parser (Zero dependencies for XLSX/Excel)
*   **Styling**: Pure CSS Glassmorphism
*   **Auth**: Secure JWT + Bcrypt

---

## 📦 One-Click Deployment

This tracker is optimized for **Vercel**. 

1. Push your code to GitHub.
2. Link your repository to Vercel.
3. Import your Environment Variables.
4. **Done!** The app will automatically bundle the internal `leetcode_all_questions.csv` database for production-grade lookups.

---

<div align="center">

### 🎯 Ready to crush your next interview?

[Report a Bug](https://github.com/Kv-Logics/leetcode-tracker/issues) • [Request a Feature](https://github.com/Kv-Logics/leetcode-tracker/discussions)

**Built with ❤️ for the Developer Community**

</div>
