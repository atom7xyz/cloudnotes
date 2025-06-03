import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // In production, this would be hashed
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Omit<User, 'password'>;
  token?: string;
}

// Simple in-memory database for demo purposes
class AuthService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, string> = new Map(); // token -> userId

  constructor() {
    // Add a demo user for testing
    this.users.set('bart@simpson.tv', {
      id: 'demo-user-id',
      email: 'bart@simpson.tv',
      firstName: 'Bart',
      lastName: 'Simpson',
      password: 'password123',
      createdAt: new Date()
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Check if user already exists
    if (this.users.has(data.email)) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match'
      };
    }

    // Check terms acceptance
    if (!data.acceptTerms) {
      return {
        success: false,
        message: 'You must accept the terms and conditions'
      };
    }

    // Create new user
    const userId = crypto.randomUUID();
    const newUser: User = {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password, // In production, hash this
      createdAt: new Date()
    };

    // Store user
    this.users.set(data.email, newUser);

    // Create session token
    const token = crypto.randomUUID();
    this.sessions.set(token, userId);

    console.log('User registered successfully:', { email: data.email, id: userId });

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: newUser.createdAt
      },
      token
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const user = this.users.get(data.email);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // In production, you would compare hashed passwords
    if (user.password !== data.password) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Create session token
    const token = crypto.randomUUID();
    this.sessions.set(token, user.id);

    console.log('User logged in successfully:', { email: data.email, id: user.id });

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      token
    };
  }

  async logout(token: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const userId = this.sessions.get(token);
    if (!userId) {
      return {
        success: false,
        message: 'Invalid session'
      };
    }

    this.sessions.delete(token);
    console.log('User logged out successfully:', { userId });

    return {
      success: true,
      message: 'Logout successful'
    };
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    const userId = this.sessions.get(token);
    if (!userId) {
      return {
        success: false,
        message: 'Invalid or expired session'
      };
    }

    // Find user by ID
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) {
      this.sessions.delete(token);
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      token
    };
  }

  getAllUsers(): Omit<User, 'password'>[] {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt
    }));
  }
}

export const authService = new AuthService(); 