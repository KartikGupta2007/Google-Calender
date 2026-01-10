// Offline Authentication System
// Simple client-side authentication that works without any server

import { offlineDb, OfflineUser } from './offline-db';

export interface OfflineSession {
  user: {
    name: string;
    email: string;
    image: string;
  } | null;
  isAuthenticated: boolean;
}

class OfflineAuthService {
  private readonly SESSION_KEY = 'offline_auth_session';
  private readonly DEMO_USERS = [
    {
      id: 'user_1',
      name: 'Kartik Gupta',
      email: 'kartik@example.com',
      avatar: '',
    },
    {
      id: 'user_2',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: '',
    },
  ];

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const user = await offlineDb.getUser();
    return user !== null;
  }

  // Get current session
  async getSession(): Promise<OfflineSession> {
    const user = await offlineDb.getUser();

    if (!user) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    return {
      user: {
        name: user.name,
        email: user.email,
        image: user.avatar,
      },
      isAuthenticated: true,
    };
  }

  // Sign in with email (offline)
  async signIn(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find or create user
      let user = this.DEMO_USERS.find(u => u.email === email);

      if (!user) {
        user = {
          id: `user_${Date.now()}`,
          name: name || email.split('@')[0],
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=3AA57A&color=fff`,
        };
      }

      const offlineUser: OfflineUser = {
        ...user,
        createdAt: new Date().toISOString(),
      };

      await offlineDb.setUser(offlineUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in'
      };
    }
  }

  // Sign in with demo account
  async signInAsDemo(): Promise<{ success: boolean; error?: string }> {
    return this.signIn('kartik@example.com', 'Kartik Gupta');
  }

  // Sign out
  async signOut(): Promise<void> {
    await offlineDb.deleteUser();
  }

  // Get current user
  async getCurrentUser(): Promise<OfflineUser | null> {
    return offlineDb.getUser();
  }

  // Update user profile
  async updateUser(updates: Partial<OfflineUser>): Promise<void> {
    const currentUser = await offlineDb.getUser();
    if (!currentUser) return;

    const updatedUser: OfflineUser = {
      ...currentUser,
      ...updates,
    };

    await offlineDb.setUser(updatedUser);
  }
}

export const offlineAuth = new OfflineAuthService();
