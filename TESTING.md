# ACC Website Testing Suite

This document describes the automated testing setup for the ACC website to ensure all existing functionalities work before deployment.

## 🧪 Test Coverage

The test suite covers all existing functionalities:

### Authentication
- ✅ Auth refresh endpoints
- ✅ Session management

### Member Management
- ✅ Create member
- ✅ Read member list
- ✅ Update member
- ✅ Delete member

### Member Dues
- ✅ Create member dues
- ✅ Read member dues list
- ✅ Settle member dues

### General Expenses
- ✅ Create general expenses
- ✅ Read general expenses list
- ✅ Settle general expenses

### Seasons Management
- ✅ Create seasons
- ✅ Read seasons list

### Teams Management
- ✅ Read teams list

### Tournament Formats
- ✅ Read tournament formats list

### Access Control
- ✅ User role management

### Export APIs (Placeholder Tests)
- ✅ Export download endpoint
- ✅ Daily export endpoint

### Notification APIs (Placeholder Tests)
- ✅ Member dues notifications

### Cron Job APIs (Placeholder Tests)
- ✅ Daily export cron

### Frontend Pages
- ✅ Home page
- ✅ Admin console
- ✅ All admin sub-pages
- ✅ Join page

## 🚀 Running Tests

### Prerequisites
1. Node.js installed
2. Application running on localhost:3000 (for local testing)

### Local Testing

#### Option 1: Using npm scripts
```bash
# Run tests against localhost:3000
npm run test

# Run tests against production URL
npm run test:ci
```

#### Option 2: Using batch file (Windows)
```bash
# Double-click run-tests.bat or run from command line
run-tests.bat
```

#### Option 3: Using PowerShell (Windows)
```powershell
# Run from PowerShell
.\run-tests.ps1
```

#### Option 4: Direct execution
```bash
# Run directly with Node.js
node test-suite.js

# Run against specific URL
TEST_BASE_URL=https://your-production-url.com node test-suite.js
```

### CI/CD Testing

The GitHub Actions workflow automatically runs tests on:
- Every push to main/master branch
- Every pull request

## 📊 Test Results

The test suite provides detailed results:
- ✅ Passed tests
- ❌ Failed tests with error messages
- 📈 Success rate percentage
- 🚨 Deployment blocking if any tests fail

## 🔧 Adding New Tests

When adding new functionality, add corresponding tests to `test-suite.js`:

1. Create a new test function:
```javascript
async function testNewFeature() {
  const response = await makeRequest(`${API_BASE}/new-feature`);
  if (response.status !== 200) {
    throw new Error(`New feature endpoint returned ${response.status}`);
  }
}
```

2. Add it to the test runner:
```javascript
await runTest('New Feature API', testNewFeature);
```

## 🚨 Deployment Safety

The test suite is designed to prevent broken deployments:

- **Local Development**: Run `npm run test` before committing
- **CI/CD**: Tests run automatically on push/PR
- **Manual Deployment**: Run `npm run predeploy` before deploying

If any tests fail, deployment is blocked until issues are resolved.

## 🐛 Troubleshooting

### Common Issues

1. **Application not running**
   - Start with: `npm run dev`
   - Ensure it's running on localhost:3000

2. **Database connection issues**
   - Check Supabase credentials in .env.local
   - Ensure database is accessible

3. **Test data conflicts**
   - Tests create temporary data that gets cleaned up
   - If tests fail, check for data conflicts

4. **Network issues**
   - Check if localhost:3000 is accessible
   - Verify firewall settings

### Debug Mode

Run tests with verbose output:
```bash
DEBUG=true node test-suite.js
```

## 📝 Test Configuration

Environment variables for testing:
- `TEST_BASE_URL`: Base URL for testing (default: http://localhost:3000)
- `DEBUG`: Enable debug output (optional)

## 🔄 Continuous Integration

The GitHub Actions workflow:
1. Installs dependencies
2. Runs linting
3. Runs all tests
4. Builds application
5. Runs production tests
6. Deploys if all tests pass

## 📈 Monitoring

Test results are logged and can be integrated with:
- GitHub Actions
- Slack notifications
- Email alerts
- Monitoring dashboards

## 🎯 Best Practices

1. **Always run tests before committing**
2. **Add tests for new features immediately**
3. **Keep tests up to date with API changes**
4. **Use descriptive test names**
5. **Clean up test data after tests**
6. **Handle errors gracefully in tests**

## 📞 Support

If you encounter issues with the test suite:
1. Check this documentation
2. Review test output for specific errors
3. Ensure all dependencies are installed
4. Verify application is running correctly
