import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required for approval tokens');
}

export interface DecisionPayload {
  appId: string;
  action: 'approve' | 'reject';
}

export function signDecision(
  payload: DecisionPayload, 
  expiresIn: string = '7d'
): string {
  try {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn } as jwt.SignOptions);
  } catch (error) {
    console.error('Error signing decision token:', error);
    throw new Error('Failed to create decision token');
  }
}

export function verifyDecision(token: string): DecisionPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as DecisionPayload;
    
    if (!decoded.appId || !decoded.action) {
      throw new Error('Invalid token payload');
    }
    
    if (decoded.action !== 'approve' && decoded.action !== 'reject') {
      throw new Error('Invalid action in token');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Decision token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid decision token');
      }
    }
    console.error('Error verifying decision token:', error);
    throw new Error('Failed to verify decision token');
  }
}

// Helper function to create decision URLs
export function createDecisionUrls(appId: string): {
  approveUrl: string;
  rejectUrl: string;
} {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const approveToken = signDecision({ appId, action: 'approve' });
  const rejectToken = signDecision({ appId, action: 'reject' });
  
  return {
    approveUrl: `${baseUrl}/api/curator/decision?token=${approveToken}`,
    rejectUrl: `${baseUrl}/api/curator/decision?token=${rejectToken}`,
  };
}
