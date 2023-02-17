// firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Add project firebase config
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

const useFirebase = () => {
  let app = null;
  // Initialize Firebase
  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  // Initialize Firebase Authentication and get a reference to the service
  const auth = getAuth(app);

  return {
    app,
    auth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
  };
};

export default useFirebase;
