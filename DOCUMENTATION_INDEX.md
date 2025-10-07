# Port SDK Documentation Index

Complete index of all documentation for quick reference.

## 📁 Project Structure

```
port-js/
├── .cursor/                              # AI coding assistant rules
│   ├── README.md                         # Cursor rules overview
│   ├── rules                             # Main development standards
│   └── rules-examples                    # Example & testing standards
│
├── docs/                                 # Documentation
│   ├── README.md                         # Documentation hub
│   ├── FAQ.md                            # Common questions
│   ├── TESTING.md                        # Testing guide
│   ├── TYPE_GENERATION_STRATEGY.md       # Type management
│   ├── UPDATING_TYPES.md                 # API update process
│   └── development/                      # Development guides
│       ├── STANDARDS.md                  # Code standards
│       ├── SECURITY_GUIDELINES.md        # Security practices
│       └── EXAMPLES_GUIDE.md             # Example writing
│
├── examples/                             # Code examples
│   ├── README.md                         # Examples guide
│   ├── .env.example                      # Environment template
│   ├── 01-basic-usage.ts                 # Getting started
│   ├── 02-authentication.ts              # Auth patterns
│   └── advanced/                         # Advanced examples
│
├── src/                                  # Source code
│   ├── types/                            # Type definitions
│   │   ├── README.md                     # Types organization
│   │   ├── api.ts                        # Auto-generated (22k lines)
│   │   ├── common.ts                     # Common types
│   │   ├── entities.ts                   # Entity types
│   │   ├── blueprints.ts                 # Blueprint types
│   │   ├── actions.ts                    # Action types
│   │   └── scorecards.ts                 # Scorecard types
│   └── ...
│
├── tests/                                # Test suite
│   ├── unit/                             # Unit tests
│   ├── integration/                      # Integration tests
│   ├── fixtures/                         # Test data
│   └── helpers/                          # Test utilities
│
├── README.md                             # Main README
├── SECURITY.md                           # Security policy
├── CONTRIBUTING.md                       # Contribution guide
├── CHANGELOG.md                          # Version history
└── LICENSE                               # MIT License
```

## 📖 Quick Navigation

### For New Users
1. [Main README](./README.md) - Start here
2. [Installation](./README.md#installation)
3. [Running Examples](./docs/EXAMPLES.md) - **Learn by doing!**
4. [Examples Index](./examples/README.md)
5. [FAQ](./docs/FAQ.md)

### For Developers
1. [Development Standards](./docs/development/STANDARDS.md)
2. [Security Guidelines](./docs/development/SECURITY_GUIDELINES.md)
3. [Testing Guide](./docs/TESTING.md)
4. [Examples Guide](./docs/development/EXAMPLES_GUIDE.md)

### For Contributors
1. [Contributing Guide](./CONTRIBUTING.md)
2. [Security Policy](./SECURITY.md)
3. [Development Standards](./docs/development/STANDARDS.md)
4. [Pull Request Process](./CONTRIBUTING.md#pull-request-process)

### For Maintainers
1. [Type Generation Strategy](./docs/TYPE_GENERATION_STRATEGY.md)
2. [Updating Types](./docs/UPDATING_TYPES.md)
3. [Release Process](./CONTRIBUTING.md#release-process)
4. [CHANGELOG](./CHANGELOG.md)

## 📚 Documentation by Topic

### Authentication & Configuration
- [Authentication Methods](./README.md#authentication)
- [Region Configuration](./README.md#regional-configuration)
- [Proxy Setup](./README.md#proxy-configuration)
- [Environment Variables](./README.md#environment-variables-reference)

### Security
- [Security Policy](./SECURITY.md)
- [Security Guidelines](./docs/development/SECURITY_GUIDELINES.md)
- [Best Practices](./README.md#security-best-practices)
- [Credential Management](./docs/development/SECURITY_GUIDELINES.md#credential-management)

### Development
- [Code Standards](./docs/development/STANDARDS.md)
- [TypeScript Guidelines](./docs/development/STANDARDS.md#typescript-standards)
- [Error Handling](./docs/development/STANDARDS.md#error-handling)
- [API Architecture](./docs/development/STANDARDS.md#api-client-architecture)

### Testing
- [Testing Guide](./docs/TESTING.md)
- [Unit Testing](./docs/TESTING.md#unit-testing)
- [Integration Testing](./docs/TESTING.md#integration-testing)
- [Coverage Requirements](./docs/TESTING.md#coverage-requirements)

### Examples
- [Examples README](./examples/README.md)
- [Example Structure](./docs/development/EXAMPLES_GUIDE.md#example-structure)
- [Security Rules](./docs/development/EXAMPLES_GUIDE.md#security-rules)
- [Quality Checklist](./docs/development/EXAMPLES_GUIDE.md#quality-checklist)

### Types & API
- [Types README](./src/types/README.md)
- [Type Generation Strategy](./docs/TYPE_GENERATION_STRATEGY.md)
- [Updating Types](./docs/UPDATING_TYPES.md)
- [FAQ - Type Management](./docs/FAQ.md#q-the-typesapits-file-is-22000-lines-how-do-i-manage-this)

## 🔍 Finding What You Need

### Common Questions
- **"How do I get started?"** → [Main README](./README.md)
- **"How do I authenticate?"** → [Authentication](./README.md#authentication)
- **"Where are the examples?"** → [Examples Directory](./examples/)
- **"How do I contribute?"** → [Contributing Guide](./CONTRIBUTING.md)
- **"How do I handle errors?"** → [Error Handling](./README.md#error-handling)
- **"How do I update types?"** → [Updating Types](./docs/UPDATING_TYPES.md)
- **"How do I write tests?"** → [Testing Guide](./docs/TESTING.md)
- **"What about security?"** → [Security Guidelines](./docs/development/SECURITY_GUIDELINES.md)

### By File Type
- **`.md` files** - Documentation
- **`.ts` files in src/** - Source code
- **`.ts` files in examples/** - Usage examples (run with `pnpm tsx examples/<file>.ts`)
- **`.test.ts` files** - Tests
- **`.cursor/rules*`** - AI assistant rules

## 🔗 External Resources

- [Port.io Website](https://getport.io)
- [Port.io Documentation](https://docs.getport.io)
- [Port.io API Reference](https://docs.getport.io/api-reference)
- [GitHub Repository](https://github.com/port-experimental/port-sdk)
- [npm Package](https://www.npmjs.com/package/@port-experimental/port-sdk)

## 📝 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| README.md | ✅ Complete | Current |
| SECURITY.md | ✅ Complete | Current |
| CONTRIBUTING.md | ✅ Complete | Current |
| docs/EXAMPLES.md | ✅ Complete | Current |
| docs/TESTING.md | ✅ Complete | Current |
| docs/FAQ.md | ✅ Complete | Current |
| docs/development/* | ✅ Complete | Current |
| examples/README.md | ✅ Complete | Current |
| src/types/README.md | ✅ Complete | Current |

---

**Need help finding something?** Open an [issue](https://github.com/port-experimental/port-sdk/issues) or check the [FAQ](./docs/FAQ.md).

