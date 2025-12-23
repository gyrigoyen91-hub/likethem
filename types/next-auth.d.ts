import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: 'ADMIN' | 'BUYER' | 'CURATOR'
    fullName?: string
    avatar?: string
    curatorProfileId?: string
    storeName?: string
    isPublic?: boolean
    isEditorsPick?: boolean
  }

  interface Session {
    user: {
      id?: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: 'ADMIN' | 'BUYER' | 'CURATOR' // CRITICAL: role should always be present
      fullName?: string | null
      avatar?: string | null
      phone?: string | null
      curatorProfileId?: string | null
      storeName?: string | null
      isPublic?: boolean | null
      isEditorsPick?: boolean | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'ADMIN' | 'BUYER' | 'CURATOR' // CRITICAL: role should always be present
    id?: string
    fullName?: string
    avatar?: string
    phone?: string
    curatorProfileId?: string
    storeName?: string
    isPublic?: boolean
    isEditorsPick?: boolean
  }
} 