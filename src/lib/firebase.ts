import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export interface Photo {
  id?: string;
  url: string;
  albumId: string;
  createdAt: any;
}

export interface Album {
  id?: string;
  title: string;
  date: any;
  category: 'wedding' | 'baby' | 'couple' | 'travel' | 'reportage';
  description?: string;
  coverImage: string;
}

export interface Review {
  id?: string;
  clientName: string;
  content: string;
  date: any;
}
