import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    role: string
    fullName?: string
    avatar?: string
    curatorProfileId?: string
    storeName?: string
    isPublic?: boolean
    isEditorsPick?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      role: string
      fullName?: string
      avatar?: string
      curatorProfileId?: string
      storeName?: string
      isPublic?: boolean
      isEditorsPick?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    fullName?: string
    avatar?: string
    curatorProfileId?: string
    storeName?: string
    isPublic?: boolean
    isEditorsPick?: boolean
  }
} 