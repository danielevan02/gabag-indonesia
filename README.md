# Gabag Indonesia E-Commerce

A modern, full-stack e-commerce platform for baby products built with Next.js 15, featuring advanced voucher management, payment integration, and shipping automation.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products by categories, subcategories, and events
- **Product Variants**: Support for products with multiple variants (size, color, etc.)
- **Smart Search & Filtering**: Advanced product search and filtering capabilities
- **Shopping Cart**: Persistent cart with session management
- **Voucher System**:
  - Multiple voucher types (fixed amount, percentage)
  - Auto-apply eligible vouchers
  - Stackable vouchers support
  - Scope-based discounts (category, product, variant-specific)
- **Checkout Process**:
  - Real-time shipping cost calculation via Biteship API
  - Multiple courier options (JNE, J&T, SiCepat, etc.)
  - Secure payment via Midtrans
  - Order tracking
- **User Authentication**: Secure sign-in/sign-up with NextAuth.js
- **Order History**: Track and review past orders

### Admin Features
- **Dashboard**: Overview of sales, orders, and inventory
- **Product Management**:
  - CRUD operations for products and variants
  - Bulk image upload via Cloudinary
  - Stock management
  - Discount configuration
- **Category Management**: Organize products with categories and subcategories
- **Event Management**: Create promotional events with special discounts
- **Voucher Management**:
  - Create and edit vouchers with restrictions
  - Usage tracking and analytics
  - Automatic validation for used vouchers
  - Prevent deletion of active vouchers
- **Order Management**:
  - View and process orders
  - Bulk shipment creation
  - Payment status tracking
  - Automatic stock deduction on payment confirmation
- **Carousel Management**: Dynamic homepage carousel with responsive images
- **Media Library**: Centralized media management with Cloudinary integration

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: tRPC for type-safe API calls

### Backend
- **API**: tRPC (End-to-end typesafe APIs)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma 6.5
- **Authentication**: NextAuth.js v5

### External Services
- **Payment**: Midtrans Payment Gateway
- **Shipping**: Biteship API (rates & order creation)
- **Media Storage**: Cloudinary
- **Email**: (TBD - for order confirmations)

### DevOps
- **Package Manager**: pnpm
- **Version Control**: Git
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (or Neon serverless account)
- Cloudinary account
- Midtrans account (sandbox/production)
- Biteship API account

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd gabag-ind-2
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_SERVER_KEY="your-server-key"

# Biteship
TEST_BITESHIP_API_KEY="your-biteship-key"
NEXT_PUBLIC_ORIGIN_POSTAL_CODE="your-origin-postal-code"
NEXT_PUBLIC_ORIGIN_AREA_ID="your-origin-area-id"
NEXT_PUBLIC_COURIERS="jne,jnt,sicepat" # comma-separated courier codes

# Store Info
NEXT_PUBLIC_APP_NAME="Gabag Indonesia"
NEXT_PUBLIC_PHONE_NUMBER="08123456789"
NEXT_PUBLIC_ADDRESS="Your store address"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# (Optional) Seed database
pnpm prisma db seed
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
gabag-ind-2/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (root)/           # Customer-facing pages
│   │   ├── admin/            # Admin panel
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── shared/           # Reusable components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   ├── trpc/                 # tRPC setup and routers
│   └── types/                # TypeScript type definitions
├── .env                      # Environment variables
└── package.json
```

## 🎯 Key Workflows

### Creating a Voucher

1. Navigate to Admin → Voucher → Add Voucher
2. Configure voucher settings:
   - Basic info (code, name, description)
   - Discount type and value
   - Application scope (all products, category, specific products, etc.)
   - Validity period with date & time
   - Usage limits
   - Behavior settings (auto-apply, stackable)
3. Submit to create

### Processing Orders

1. Customer completes checkout and payment
2. Webhook from Midtrans updates payment status
3. Admin creates shipment (single or bulk)
4. Biteship generates waybill ID
5. Customer receives tracking information

### Bulk Shipment Creation

1. Select multiple paid orders (settlement/capture status)
2. Click "Create Shipment for X order(s)"
3. System automatically:
   - Filters eligible orders
   - Uses courier from each order
   - Creates shipments via Biteship
   - Updates tracking numbers

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma studio    # Open Prisma Studio
pnpm prisma generate  # Generate Prisma Client
pnpm prisma migrate   # Run database migrations

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
```

## 📚 API Documentation

### tRPC Routers

- **product**: Product CRUD operations
- **category**: Category management
- **subCategory**: Subcategory management
- **variant**: Product variant operations
- **event**: Event management
- **voucher**: Voucher CRUD and validation
- **order**: Order processing and management
- **cart**: Shopping cart operations
- **courier**: Shipping rates and shipment creation
- **carousel**: Homepage carousel management

For detailed API schemas, check `/src/trpc/routers/`

## 🔐 Security Considerations

- All admin routes are protected with authentication
- Input validation using Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection with React's built-in escaping
- Secure payment processing via Midtrans
- Environment variables for sensitive data

## 🐛 Known Issues & Limitations

- Bulk shipment creation processes orders sequentially (not parallel)
- Voucher edit restrictions apply after first usage
- Some courier services may not be available in all areas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

https://www.linkedin.com/in/daniel-evan-6183851b8/

## 👥 Authors

- Daniel Evan Khalfany

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- tRPC for type-safe APIs
- All open-source contributors

---

**Built with ❤️ using Next.js 15**
