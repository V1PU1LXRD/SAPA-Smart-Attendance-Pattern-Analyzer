# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Active support  |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public
issue. Instead, email **vipul.kanhere@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

We will respond within **48 hours** and work on a fix immediately.

## Security Practices

- All passwords are hashed with **bcrypt**
- Authentication via **JWT tokens**
- OTP-based email verification
- Input sanitization on all endpoints
- File upload validation and cleanup
- Environment variables for all secrets