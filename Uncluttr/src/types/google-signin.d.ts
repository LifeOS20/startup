declare module '@react-native-google-signin/google-signin' {
  export interface User {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  }

  export interface GoogleSigninType {
    configure(options?: any): void;
    signIn(): Promise<any>;
    signInSilently(): Promise<any>;
    signOut(): Promise<void>;
    revokeAccess(): Promise<void>;
    isSignedIn(): Promise<boolean>;
    hasPlayServices(): Promise<boolean>;
    getCurrentUser(): Promise<User | null>;
    getTokens(): Promise<{ accessToken: string; idToken: string }>;
  }

  export const GoogleSignin: GoogleSigninType;
}