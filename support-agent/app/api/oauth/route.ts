import { NextRequest } from 'next/server';
import { McpOAuthService } from '@/lib/mcp/oauth-service';

const oauthService = new McpOAuthService({
  clientId: process.env.CLIENT_ID || '',
  redirectUri: process.env.REDIRECT_URI || '',
});

/**
 * Initiate OAuth flow
 * GET /api/oauth/authorize?resource=<server_url>
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const resource = searchParams.get('resource');

  if (!resource) {
    return Response.json(
      { error: 'Missing resource parameter' },
      { status: 400 }
    );
  }

  try {
    // Check if already authenticated
    if (oauthService.isAuthenticated(resource)) {
      return Response.json({
        authenticated: true,
        message: 'Already authenticated for this resource',
      });
    }

    // Initiate OAuth flow
    const authUrl = await oauthService.initiateOAuthFlow(resource);

    return Response.json({
      authenticated: false,
      authorizationUrl: authUrl,
    });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return Response.json(
      { 
        error: 'Failed to initiate OAuth flow',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * Logout from OAuth
 * POST /api/oauth/logout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource } = body;

    if (!resource) {
      return Response.json(
        { error: 'Missing resource parameter' },
        { status: 400 }
      );
    }

    oauthService.logout(resource);

    return Response.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

/**
 * Check authentication status
 * GET /api/oauth/status?resource=<server_url>
 */
export async function checkStatus(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const resource = searchParams.get('resource');

  if (!resource) {
    return Response.json(
      { error: 'Missing resource parameter' },
      { status: 400 }
    );
  }

  const isAuthenticated = oauthService.isAuthenticated(resource);

  return Response.json({
    resource,
    isAuthenticated,
  });
}
