# Contributing to LeetCode Company Tracker

First off, thank you for considering contributing to LeetCode Company Tracker! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the existing style
4. Make sure your code lints
5. Issue that pull request!

## Development Process

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/leetcode-tracker.git
   cd leetcode-tracker
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow TypeScript best practices
   - Add comments for complex logic

4. **Test your changes**
   ```bash
   npm run dev
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add some feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Open a Pull Request**

## Style Guide

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### Code Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Keep lines under 100 characters when possible

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

Example:
```
Add bookmark export feature

- Implement CSV export for bookmarks
- Add download button to bookmark panel
- Update documentation

Fixes #123
```

## Project Structure

```
app/
├── api/          # API routes
├── admin/        # Admin pages
├── upload/       # Upload pages
└── page.tsx      # Main page

lib/
├── auth.ts       # Authentication logic
├── db.ts         # Database helpers
└── supabase.ts   # Supabase client
```

## Testing

Before submitting a PR, please test:

1. User signup and login
2. Problem tracking (check/uncheck)
3. Company switching
4. Bookmark creation and management
5. Admin features (if applicable)
6. CSV upload
7. Search and filter functionality

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🎉
