# Volume Discount App for Shopify

A production-ready Shopify app that enables merchants to offer **"Buy X, Get Y% Off"** volume-based discounts. Built with React Router, Shopify Functions, and Prisma.

![Shopify](https://img.shields.io/badge/Shopify-7AB55C?style=for-the-badge&logo=shopify&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

---

## Overview

This app allows Shopify merchants to:
- Select products that qualify for volume discounts
- Set a discount percentage (1-80%)
- Automatically apply discounts at checkout when customers buy 2+ units
- Display promotional banners on product pages

**Example:** "Buy 2 or more, get 10% off!"

---

## Features

| Feature | Description |
|---------|-------------|
| **Admin Dashboard** | Easy-to-use interface for configuring discount rules |
| **Product Selection** | Browse and select products with images |
| **Shopify Function** | Server-side discount calculation at checkout |
| **Theme Extension** | Customizable promotional banner for storefronts |
| **Session Management** | Secure OAuth with Prisma session storage |
| **Webhook Handling** | Automatic cleanup on app uninstall |

---

## Tech Stack

### Backend
- **Framework:** [React Router v7](https://reactrouter.com/) (SSR)
- **Database:** [Prisma](https://www.prisma.io/) with SQLite (dev) / PostgreSQL (prod)
- **API:** Shopify Admin GraphQL API (2025-04)
- **Auth:** [@shopify/shopify-app-react-router](https://www.npmjs.com/package/@shopify/shopify-app-react-router)

### Frontend
- **UI Library:** React 18
- **Components:** [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library) Web Components
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** TypeScript

### Extensions
- **Shopify Function:** WASM-based discount logic
- **Theme Extension:** Liquid template for storefront banner

---

## Project Structure

```
volume-discount-app/
├── app/                              # Main React Router application
│   ├── routes/
│   │   ├── app._index.tsx            # Main configuration page
│   │   ├── app.tsx                   # Admin layout with navigation
│   │   ├── app.additional.tsx        # Additional page template
│   │   ├── auth.$.tsx                # Auth catch-all route
│   │   ├── auth.login/               # Login pages
│   │   ├── webhooks.app.uninstalled.tsx
│   │   └── webhooks.app.scopes_update.tsx
│   ├── shopify.server.ts             # Shopify API configuration
│   ├── db.server.ts                  # Prisma client initialization
│   ├── root.tsx                      # Root HTML document
│   └── entry.server.tsx              # Server entry point
│
├── extensions/
│   ├── volume-discount/              # Discount Function Extension
│   │   ├── src/
│   │   │   ├── cart_lines_discounts_generate_run.js
│   │   │   ├── cart_lines_discounts_generate_run.graphql
│   │   │   └── *.test.js             # Unit tests
│   │   └── shopify.extension.toml
│   │
│   └── discount-widget/              # Theme Extension
│       ├── blocks/
│       │   └── discount-banner.liquid
│       └── shopify.extension.toml
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
│
├── public/                           # Static assets
├── shopify.app.toml                  # Shopify app configuration
├── shopify.web.toml                  # Web component configuration
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
├── Dockerfile                        # Docker configuration
└── package.json
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | >=20.19 <22 or >=22.12 |
| npm | Latest |
| Shopify CLI | Latest |

You'll also need:
- A [Shopify Partner Account](https://partners.shopify.com/signup)
- A [Development Store](https://help.shopify.com/en/partners/dashboard/development-stores)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:SrinivasNarayansetty/shopify-discount-app.git
   cd shopify-discount-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run setup
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Install on your development store**
   - Press `P` in the terminal to open the app URL
   - Click "Install" on your development store

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Shopify CLI |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run setup` | Initialize Prisma & run migrations |
| `npm run deploy` | Deploy app to Shopify |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests |
| `npm run docker-start` | Start with Docker |
| `npm run generate` | Generate extensions with Shopify CLI |

---

## How It Works

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHOPIFY ADMIN                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Volume Discount App                     │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │  │
│  │  │   Select    │  │     Set      │  │      Save       │   │  │
│  │  │  Products   │─▶│  Discount %  │─▶│  Configuration  │   │  │
│  │  └─────────────┘  └──────────────┘  └────────┬────────┘   │  │
│  └──────────────────────────────────────────────┼────────────┘  │
└─────────────────────────────────────────────────┼───────────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │   Shopify Metafield     │
                                    │   namespace: volume_    │
                                    │   discount              │
                                    │   key: rules            │
                                    └────────────┬────────────┘
                                                 │
┌────────────────────────────────────────────────┼────────────────┐
│                      STOREFRONT                │                │
│  ┌─────────────────┐                           │                │
│  │ Product Page    │◀──Theme Extension─────────┤                │
│  │ ┌─────────────┐ │   (Banner Display)        │                │
│  │ │🎉 Buy 2,    │ │                           │                │
│  │ │get 10% off! │ │                           │                │
│  │ └─────────────┘ │                           │                │
│  └─────────────────┘                           │                │
│                                                │                │
│  ┌─────────────────────────────────────────────▼──────────────┐ │
│  │                        CHECKOUT                            │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │              Shopify Function (WASM)                │   │ │
│  │  │  1. Read cart lines                                 │   │ │
│  │  │  2. Read metafield configuration                    │   │ │
│  │  │  3. Check: product in list? qty >= 2?               │   │ │
│  │  │  4. Apply discount: "Buy 2, get X% off"             │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration Data Structure

The discount configuration is stored as a JSON metafield:

```json
{
  "products": [
    "gid://shopify/Product/1234567890",
    "gid://shopify/Product/0987654321"
  ],
  "minQty": 2,
  "percentOff": 10
}
```

| Property | Type | Description |
|----------|------|-------------|
| `products` | Array<string> | Shopify Product GIDs |
| `minQty` | number | Minimum quantity for discount |
| `percentOff` | number | Discount percentage (1-80) |

**Metafield Location:**
- **Namespace:** `volume_discount`
- **Key:** `rules`
- **Owner:** App Installation

---

## Extensions

### 1. Volume Discount Function

**Location:** `extensions/volume-discount/`

| Property | Value |
|----------|-------|
| Type | Shopify Function (WASM) |
| Target | `cart.lines.discounts.generate.run` |
| API Version | 2025-04 |

**Discount Logic:**
1. Retrieves configuration from app installation metafield
2. Iterates through cart lines
3. For each qualifying product with qty >= 2:
   - Calculates percentage discount
   - Returns discount object with message

**Input Query:** `src/cart_lines_discounts_generate_run.graphql`

### 2. Discount Widget (Theme Extension)

**Location:** `extensions/discount-widget/`

| Property | Value |
|----------|-------|
| Type | Theme App Extension |
| Block | Volume Discount Banner |
| Placement | Product pages |

**Customization:** Merchants can adjust the discount percentage in the theme editor.

**Preview:**
```
┌────────────────────────────────────────┐
│  🎉 Buy 2, get 10% off!                │
└────────────────────────────────────────┘
```

---

## Database

### Schema (Prisma)

```prisma
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean   @default(false)
  locale        String?
  collaborator  Boolean?
  emailVerified Boolean?
}
```

### Supported Databases

| Database | Environment | Notes |
|----------|-------------|-------|
| SQLite | Development | Default, file-based |
| PostgreSQL | Production | Recommended |
| MySQL | Production | Supported |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_API_KEY` | Yes | App API key from Partner Dashboard |
| `SHOPIFY_API_SECRET` | Yes | App API secret |
| `SHOPIFY_APP_URL` | Yes | App URL (auto-set by Shopify CLI) |
| `DATABASE_URL` | Yes | Database connection string |
| `SCOPES` | No | OAuth scopes (default: `write_products`) |
| `NODE_ENV` | No | `development` or `production` |

---

## Webhooks

| Webhook | Endpoint | Purpose |
|---------|----------|---------|
| `app/uninstalled` | `/webhooks/app/uninstalled` | Clean up session on uninstall |
| `app/scopes_update` | `/webhooks/app/scopes_update` | Update session on scope change |

---

## API Scopes

| Scope | Purpose |
|-------|---------|
| `write_products` | Read product data for selection UI |

---

## Deployment

### Option 1: Docker

```bash
# Build image
docker build -t volume-discount-app .

# Run container
docker run -p 3000:3000 \
  -e SHOPIFY_API_KEY=your_key \
  -e SHOPIFY_API_SECRET=your_secret \
  -e DATABASE_URL=your_database_url \
  -e NODE_ENV=production \
  volume-discount-app
```

### Option 2: Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure environment variables**

3. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Deploy to Shopify**
   ```bash
   npm run deploy
   ```

### Hosting Providers

| Provider | Guide |
|----------|-------|
| Google Cloud Run | [Documentation](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run) |
| Fly.io | [Documentation](https://fly.io/docs/js/shopify/) |
| Render | [Documentation](https://render.com/docs/deploy-shopify-app) |
| Railway | [Documentation](https://railway.app/) |

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

Test files are located in `extensions/volume-discount/src/*.test.js`

**Test Coverage:**
- Empty cart scenarios
- Quantity threshold validation
- Product ID matching
- Configuration parsing
- Error handling

---

## Troubleshooting

### Database tables don't exist

```bash
npm run setup
```

### "nbf" claim timestamp check failed

Your system clock may be out of sync. Enable automatic time synchronization in your system settings.

### Webhooks not updating

Uninstall and reinstall the app to force re-registration.

### GraphQL hints showing wrong API

Update `.graphqlrc.ts` if using non-Admin APIs.

---

## Development Tips

### Adding New Products to Selection

The app fetches the first 50 products. For larger catalogs, implement pagination in `app/routes/app._index.tsx`.

### Changing Minimum Quantity

Currently hardcoded to 2. Modify the admin UI to make this configurable.

### Custom Discount Messages

Edit the function in `extensions/volume-discount/src/cart_lines_discounts_generate_run.js`.

---

## Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

---

## Resources

### Shopify
- [Shopify App Development](https://shopify.dev/docs/apps)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [App Bridge](https://shopify.dev/docs/api/app-bridge-library)
- [Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)

### Framework
- [React Router](https://reactrouter.com/)
- [Prisma](https://www.prisma.io/docs)
- [Vite](https://vitejs.dev/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Sri**

---

## Acknowledgments

- Built on [Shopify App Template - React Router](https://github.com/Shopify/shopify-app-template-react-router)
- Powered by [Shopify Functions](https://shopify.dev/docs/api/functions)
