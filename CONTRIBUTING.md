# Contributing to Workflow Tracker

Thank you for your interest in contributing to **Workflow Tracker**! 🦷✨

## 🤝 Ways to Contribute

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve guides and examples
- 🔧 **Code Contributions** - Submit bug fixes and enhancements
- 🎨 **Design Improvements** - UI/UX enhancements

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/workflow-tracker.git
   cd workflow-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript** - All new code should be typed
- **ESLint** - Follow the existing linting rules
- **Prettier** - Code formatting is automatic
- **Comments** - Document complex logic and medical terminology

### Component Guidelines

- **ShadCN/UI** - Use existing components when possible
- **Responsive Design** - Ensure mobile-first compatibility
- **Accessibility** - Follow WCAG guidelines
- **Medical Theme** - Maintain professional dental practice aesthetic

### Commit Messages

Use conventional commit format:

```
feat: add new progress visualization
fix: resolve stage progression bug
docs: update installation instructions
style: improve mobile responsiveness
test: add unit tests for task helpers
```

## 🏥 Medical Context

This application is designed for **dental practice workflow management**. When contributing:

- **Understand the workflow** - Each stage represents real dental practice steps
- **Maintain clinical accuracy** - Task names and progressions should be medically sound
- **Professional appearance** - UI should reflect healthcare standards
- **User safety** - Avoid changes that could impact patient care workflows

## 🧪 Testing

### Running Tests

```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
npm run lint        # Run linting
```

### Test Coverage

- **Components** - Test all user interactions
- **Utilities** - Ensure task progression logic is correct
- **API Client** - Test both Supabase and local storage fallbacks
- **Authentication** - Verify security measures

## 📦 Submitting Changes

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run the test suite** and ensure it passes
4. **Update the changelog** if applicable
5. **Submit PR** with clear description

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Medical Context
Explain any medical/dental workflow implications

## Screenshots
Add screenshots for UI changes
```

## 🛡️ Security

### Reporting Security Issues

**Do not** create public issues for security vulnerabilities. Instead:

1. Email: security@workflowtracker.com
2. Include detailed description
3. Provide steps to reproduce
4. Wait for response before disclosure

### Security Guidelines

- **Authentication** - Never bypass login requirements
- **Data Privacy** - Protect patient-related information
- **Session Management** - Maintain secure token handling
- **Input Validation** - Sanitize all user inputs

## 🎯 Feature Requests

### Before Submitting

- **Search existing issues** to avoid duplicates
- **Consider medical workflow** impact
- **Think about all user types** (staff, admin)
- **Consider mobile-first** design constraints

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Medical Use Case
How this helps dental practice workflows

## User Impact
Which user types benefit (staff/admin)

## Implementation Ideas
Technical approach suggestions

## Alternatives Considered
Other solutions you've thought about
```

## 🎨 Design Contributions

### UI/UX Guidelines

- **Medical Professional** - Clean, trustworthy appearance
- **Mobile-First** - Touch-friendly interfaces
- **Accessibility** - Screen reader compatible
- **Color Palette** - Blue, grey, purple with green completion states

### Design Assets

- Use **tooth icon** for branding
- Maintain **glassmorphism** card design
- Follow **3-color system** strictly
- Ensure **high contrast** for readability

## 📞 Community

### Getting Help

- **GitHub Discussions** - General questions and ideas
- **Issues** - Bug reports and feature requests
- **Email** - support@workflowtracker.com

### Code of Conduct

- **Be respectful** to all contributors
- **Focus on medical accuracy** and patient safety
- **Provide constructive feedback**
- **Help newcomers** get started

## 📚 Resources

### Learning Materials

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Dental Practice Context

- Understanding dental workflow stages
- HIPAA compliance considerations
- Medical terminology accuracy
- Professional healthcare standards

---

**Thank you for helping improve dental practice workflow management!** 🦷✨

Every contribution makes a difference in supporting dental professionals worldwide.