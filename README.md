# Mobile Automation Test Framework

Senior QA-level mobile web automation test framework built with **Playwright** and **TypeScript**.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Playwright | Test automation engine |
| TypeScript | Type-safe test development |
| Allure | Advanced test reporting |
| GitHub Actions | CI/CD pipeline |
| Docker | Containerized test execution |
| Faker.js | Dynamic test data generation |

## Project Structure

```
├── .github/workflows/           # CI/CD pipelines
│   ├── test-on-push.yml         # Smoke tests on push
│   ├── test-on-pr.yml           # Regression on PR
│   └── test-full-suite.yml      # Full scheduled suite
├── config/
│   ├── allure/                  # Allure categories & env
│   ├── devices.config.ts        # Mobile device profiles
│   ├── env.config.ts            # Environment configuration
│   └── test-users.config.ts     # Test user management
├── src/
│   ├── data/                    # Test data (JSON)
│   ├── fixtures/                # Custom Playwright fixtures
│   ├── pages/                   # Page Object Model
│   │   ├── base.page.ts         # Base page with shared methods
│   │   ├── login.page.ts
│   │   ├── products.page.ts
│   │   ├── product-detail.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── checkout-complete.page.ts
│   ├── tests/
│   │   ├── smoke/               # Critical path tests
│   │   ├── regression/          # Detailed functional tests
│   │   ├── e2e/                 # End-to-end user journeys
│   │   ├── visual/              # Visual regression tests
│   │   ├── api/                 # REST API tests
│   │   └── data-driven/         # Parameterized tests
│   └── utils/
│       ├── logger.ts            # Custom logging
│       ├── api-helper.ts        # API request helper
│       ├── data-generator.ts    # Fake data factory
│       ├── network-helper.ts    # Network interception
│       └── allure-helper.ts     # Allure annotations
├── playwright.config.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Copy environment config
cp .env.example .env

# Run all tests
npm test
```

## Running Tests

### By Category
```bash
npm run test:smoke          # Critical path tests
npm run test:regression     # Functional regression tests
npm run test:e2e            # End-to-end user journeys
npm run test:visual         # Visual regression tests
npm run test:api            # API endpoint tests
```

### By Device
```bash
npm run test:mobile         # iPhone 14
npm run test:android        # Pixel 7
npm run test:tablet         # iPad Pro 11
npm run test:all-devices    # All devices
```

### By Environment
```bash
npm run test:dev            # Development environment
npm run test:staging        # Staging environment
npm run test:prod           # Production (smoke only)
```

### Debug Mode
```bash
npm run test:headed         # Run with browser visible
npm run test:debug          # Step-by-step debug mode
npm run test:trace          # Enable trace recording
```

## Reports

### Playwright HTML Report
```bash
npm run report:html
```

### Allure Report
```bash
npm run report:allure:generate   # Generate report
npm run report:allure:open       # Open in browser
npm run report:allure             # Generate & open
```

## Docker

```bash
# Run smoke tests
docker compose run test-smoke

# Run regression tests
docker compose run test-regression

# Run full suite
docker compose run test-full

# Start Allure report server
docker compose up allure-report
# Visit: http://localhost:5050
```

## CI/CD Pipelines

| Pipeline | Trigger | Tests |
|----------|---------|-------|
| `test-on-push.yml` | Push to any branch | Smoke tests |
| `test-on-pr.yml` | Pull request | Regression + API |
| `test-full-suite.yml` | Daily schedule / Manual | Full suite |

## Test Categories

| Tag | Count | Description |
|-----|-------|-------------|
| `@smoke` | 12 | Critical path validation |
| `@regression` | 45+ | Detailed functional tests |
| `@e2e` | 10+ | Full user journey flows |
| `@visual` | 10+ | Screenshot comparison |
| `@api` | 15+ | REST API validation |

## Devices Supported

| Device | Type | Platform |
|--------|------|----------|
| iPhone 14 | Mobile | iOS |
| iPhone 14 Pro Max | Mobile | iOS |
| iPhone SE | Mobile | iOS |
| Pixel 7 | Mobile | Android |
| Galaxy S21 | Mobile | Android |
| iPad Pro 11 | Tablet | iOS |
| iPad Mini | Tablet | iOS |
| Galaxy Tab S4 | Tablet | Android |

## Architecture Patterns

- **Page Object Model (POM)** - Encapsulated page interactions
- **Base Page Pattern** - Common methods inherited by all pages
- **Custom Fixtures** - Reusable test setup/teardown
- **Data-Driven Testing** - External JSON test data
- **Factory Pattern** - Dynamic test data generation with Faker.js
- **Helper Pattern** - Utility classes for API, network, reporting

## License

MIT
