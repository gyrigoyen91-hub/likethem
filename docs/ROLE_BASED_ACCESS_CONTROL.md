# Role-Based Access Control (RBAC) System

This document describes the comprehensive role-based access control system implemented in the LikeThem platform.

## Overview

The RBAC system provides secure access control based on user roles: **ADMIN**, **CURATOR**, and **BUYER**. Each role has specific permissions and access levels.

## User Roles

### 1. ADMIN
- **Access Level**: Highest
- **Permissions**:
  - Access to admin dashboard (`/admin`)
  - Manage all users and their roles
  - View platform analytics
  - Moderate products and curators
  - Access all curator and buyer features
- **Routes**: `/admin/*`

### 2. CURATOR
- **Access Level**: Medium
- **Permissions**:
  - Access to curator dashboard (`/dashboard/curator`)
  - Manage their own products
  - View their store analytics
  - Manage their store profile
  - Access buyer features
- **Routes**: `/dashboard/curator/*`

### 3. BUYER
- **Access Level**: Basic
- **Permissions**:
  - Browse products
  - Add items to cart
  - Place orders
  - Manage favorites
  - Access account settings
- **Routes**: `/account/*`, `/orders/*`, `/favorites/*`, `/cart/*`

## Implementation

### 1. Database Schema

```prisma
enum Role {
  ADMIN
  CURATOR
  BUYER
}

model User {
  id    String @id @default(cuid())
  email String @unique
  role  Role   @default(BUYER)
  // ... other fields
}
```

### 2. Authentication Utilities

#### Server-Side Protection (`lib/auth.ts`)

```typescript
import { getCurrentUser, requireRole } from '@/lib/auth'

// Get current user
const user = await getCurrentUser()

// Require specific role
requireRole(user, 'ADMIN')

// Check role hierarchy
hasRole(user, 'CURATOR') // Returns true for CURATOR and ADMIN
```

#### API Route Protection (`lib/api-auth.ts`)

```typescript
import { getApiUser, requireApiRole, createApiErrorResponse } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const user = await getApiUser(request)
  
  if (!user) {
    return createApiErrorResponse('Unauthorized')
  }

  requireApiRole(user, 'ADMIN')
  
  // ... API logic
}
```

### 3. Client-Side Protection

#### Protected Route Component

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

<ProtectedRoute requiredRole="CURATOR">
  <CuratorDashboard />
</ProtectedRoute>
```

#### Session-Based Checks

```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()

if (session?.user?.role === 'ADMIN') {
  // Show admin features
}
```

## Route Protection

### 1. Middleware Protection (`middleware.ts`)

The middleware automatically protects routes based on user roles:

- `/admin/*` - Admin only
- `/dashboard/curator/*` - Curator and Admin
- `/account/*`, `/orders/*`, `/favorites/*` - Authenticated users
- `/auth/*` - Redirects authenticated users

### 2. Server-Side Protection

```typescript
// In page components
export default async function AdminPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    redirect('/unauthorized')
  }
  
  // ... page content
}
```

### 3. API Route Protection

```typescript
// In API routes
export async function GET(request: NextRequest) {
  const user = await getApiUser(request)
  
  if (!user) {
    return createApiErrorResponse('Unauthorized')
  }

  requireApiRole(user, 'CURATOR')
  
  // ... API logic
}
```

## Data Access Control

### 1. Curator Data Isolation

Curators can only access their own data:

```typescript
// Ensure curator only accesses their own products
const products = await prisma.product.findMany({
  where: { curatorId: user.curatorProfileId }
})
```

### 2. User Data Isolation

Users can only access their own data:

```typescript
// Ensure user only accesses their own cart
const cartItems = await prisma.cartItem.findMany({
  where: { userId: user.id }
})
```

### 3. Admin Override

Admins can access all data:

```typescript
if (user.role === 'ADMIN') {
  // Access all data
} else {
  // Access only user's own data
}
```

## Error Handling

### 1. Unauthorized Access

When users try to access restricted areas:

1. **Middleware**: Redirects to `/unauthorized`
2. **Server Components**: Redirects to `/unauthorized`
3. **API Routes**: Returns 401/403 error
4. **Client Components**: Shows loading state then redirects

### 2. Unauthorized Page

The `/unauthorized` page provides:
- Clear explanation of access denial
- Navigation options (Go Home, Go Back)
- Sign-in link for different account

## Security Features

### 1. Role Hierarchy

Roles follow a hierarchy where higher roles inherit permissions:

```
ADMIN (3) > CURATOR (2) > BUYER (1)
```

### 2. Session Validation

All protected routes validate:
- User authentication
- User role permissions
- Session integrity

### 3. Database-Level Security

- Foreign key constraints ensure data integrity
- Role-based queries prevent unauthorized access
- Input validation prevents injection attacks

## Usage Examples

### 1. Protecting a Page

```typescript
// app/admin/users/page.tsx
import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    redirect('/unauthorized')
  }
  
  return <AdminUsersComponent />
}
```

### 2. Protecting an API Route

```typescript
// app/api/admin/users/route.ts
import { getApiUser, requireApiRole, createApiErrorResponse } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const user = await getApiUser(request)
  
  if (!user) {
    return createApiErrorResponse('Unauthorized')
  }

  requireApiRole(user, 'ADMIN')
  
  // ... API logic
}
```

### 3. Client-Side Protection

```typescript
// components/AdminPanel.tsx
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminPanel() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>Admin-only content</div>
    </ProtectedRoute>
  )
}
```

## Testing

### 1. Role Testing

Test different user roles:
- Create test users with different roles
- Verify access to protected routes
- Test role hierarchy inheritance

### 2. Security Testing

- Attempt unauthorized access
- Verify proper error responses
- Test data isolation

### 3. Edge Cases

- Test with expired sessions
- Test with invalid roles
- Test with missing user data

## Best Practices

1. **Always validate on server-side**: Client-side checks are for UX only
2. **Use role hierarchy**: Higher roles inherit lower role permissions
3. **Isolate data access**: Users should only access their own data
4. **Log security events**: Track unauthorized access attempts
5. **Regular audits**: Review permissions and access patterns
6. **Principle of least privilege**: Grant minimum required permissions

## Troubleshooting

### Common Issues

1. **"Access denied" errors**: Check user role and route permissions
2. **Session issues**: Verify NextAuth configuration
3. **Database errors**: Check Prisma schema and migrations
4. **Middleware conflicts**: Ensure proper route matching

### Debug Steps

1. Check user session and role
2. Verify route protection configuration
3. Review middleware logs
4. Test with different user accounts 