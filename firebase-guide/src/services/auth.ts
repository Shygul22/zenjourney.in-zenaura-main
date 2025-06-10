import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { LoginCredentials, SignupCredentials, PasswordResetData, AppUser, AppError } from '../types';
import { handleFirebaseError, NetworkErrorHandler, ErrorLogger } from '../utils/errors';
import { validateEmail, validatePassword, validateDisplayName, validateConfirmPassword } from '../utils/validation';

const networkHandler = new NetworkErrorHandler();

/**
 * Authentication service class
 */
export class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((user: AppUser | null) => void)[] = [];

  private constructor() {
    this.initializeAuthStateListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize auth state listener
   */
  private initializeAuthStateListener(): void {
    onAuthStateChanged(auth, (user) => {
      const appUser = user ? this.mapFirebaseUserToAppUser(user) : null;
      this.authStateListeners.forEach(listener => listener(appUser));
    });
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current user
   */
  getCurrentUser(): AppUser | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUserToAppUser(user) : null;
  }

  /**
   * Sign up with email and password
   */
  async signUp(credentials: SignupCredentials): Promise<AppUser> {
    try {
      // Validate input
      const validationErrors = this.validateSignupCredentials(credentials);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0].message);
      }

      const { email, password, displayName } = credentials;

      // Create user account
      const userCredential = await networkHandler.executeWithRetry(() =>
        createUserWithEmailAndPassword(auth, email, password)
      );

      // Update user profile
      await updateProfile(userCredential.user, { displayName });

      // Send email verification
      await this.sendEmailVerification();

      const appUser = this.mapFirebaseUserToAppUser(userCredential.user);
      
      ErrorLogger.log({
        code: 'auth/signup-success',
        message: 'User signed up successfully'
      }, 'AuthService.signUp');

      return appUser;
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.signUp');
      throw appError;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AppUser> {
    try {
      // Validate input
      const emailError = validateEmail(credentials.email);
      if (emailError) throw new Error(emailError.message);

      if (!credentials.password) {
        throw new Error('Password is required');
      }

      const userCredential = await networkHandler.executeWithRetry(() =>
        signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      );

      const appUser = this.mapFirebaseUserToAppUser(userCredential.user);
      
      ErrorLogger.log({
        code: 'auth/signin-success',
        message: 'User signed in successfully'
      }, 'AuthService.signIn');

      return appUser;
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.signIn');
      throw appError;
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AppUser> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(auth, provider);
      const appUser = this.mapFirebaseUserToAppUser(userCredential.user);
      
      ErrorLogger.log({
        code: 'auth/google-signin-success',
        message: 'User signed in with Google successfully'
      }, 'AuthService.signInWithGoogle');

      return appUser;
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.signInWithGoogle');
      throw appError;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      
      ErrorLogger.log({
        code: 'auth/signout-success',
        message: 'User signed out successfully'
      }, 'AuthService.signOut');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.signOut');
      throw appError;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      const emailError = validateEmail(data.email);
      if (emailError) throw new Error(emailError.message);

      await networkHandler.executeWithRetry(() =>
        sendPasswordResetEmail(auth, data.email)
      );

      ErrorLogger.log({
        code: 'auth/password-reset-sent',
        message: 'Password reset email sent successfully'
      }, 'AuthService.resetPassword');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.resetPassword');
      throw appError;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await sendEmailVerification(user);
      
      ErrorLogger.log({
        code: 'auth/verification-email-sent',
        message: 'Verification email sent successfully'
      }, 'AuthService.sendEmailVerification');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.sendEmailVerification');
      throw appError;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      if (updates.displayName) {
        const nameError = validateDisplayName(updates.displayName);
        if (nameError) throw new Error(nameError.message);
      }

      await updateProfile(user, updates);
      
      ErrorLogger.log({
        code: 'auth/profile-updated',
        message: 'User profile updated successfully'
      }, 'AuthService.updateUserProfile');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.updateUserProfile');
      throw appError;
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Validate new password
      const passwordError = validatePassword(newPassword);
      if (passwordError) throw new Error(passwordError.message);

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      ErrorLogger.log({
        code: 'auth/password-updated',
        message: 'User password updated successfully'
      }, 'AuthService.updateUserPassword');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.updateUserPassword');
      throw appError;
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(password: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user
      await deleteUser(user);
      
      ErrorLogger.log({
        code: 'auth/account-deleted',
        message: 'User account deleted successfully'
      }, 'AuthService.deleteUserAccount');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'AuthService.deleteUserAccount');
      throw appError;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Check if user email is verified
   */
  isEmailVerified(): boolean {
    return auth.currentUser?.emailVerified ?? false;
  }

  /**
   * Map Firebase User to AppUser
   */
  private mapFirebaseUserToAppUser(user: User): AppUser {
    return {
      ...user,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  }

  /**
   * Validate signup credentials
   */
  private validateSignupCredentials(credentials: SignupCredentials) {
    const errors = [];

    const emailError = validateEmail(credentials.email);
    if (emailError) errors.push(emailError);

    const passwordError = validatePassword(credentials.password);
    if (passwordError) errors.push(passwordError);

    const confirmPasswordError = validateConfirmPassword(credentials.password, credentials.confirmPassword);
    if (confirmPasswordError) errors.push(confirmPasswordError);

    const displayNameError = validateDisplayName(credentials.displayName);
    if (displayNameError) errors.push(displayNameError);

    return errors;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();