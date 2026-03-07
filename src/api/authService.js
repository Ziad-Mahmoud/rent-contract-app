import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

export const login = (email, pass) =>
  signInWithEmailAndPassword(auth, email, pass);

export const register = (email, pass) =>
  createUserWithEmailAndPassword(auth, email, pass);

export const logout = () => signOut(auth);

export const loginWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);

export const getCurrentUser = () => auth.currentUser;