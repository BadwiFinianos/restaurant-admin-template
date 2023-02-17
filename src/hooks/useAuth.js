import React, { useState, useEffect } from 'react';

import useFirebase from './useFirebase';

const authContext = React.createContext();

function useAuth() {
  const { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = useFirebase();

  const [user, setUser] = useState(null);
  const isAuthed = !!user;

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (usr) => {
      if (usr !== null) {
        const { displayName, email, uid, photoURL } = usr;
        setUser({ displayName, email, uid, photoURL: photoURL ?? '/static/mock-images/avatars/avatar_default.jpg' });
      } else {
        setUser(null);
      }
    });
    return () => {
      subscriber();
    };
  }, [auth]);

  return {
    user,
    isAuthed,
    Login({ email, password }) {
      return new Promise((res) => {
        signInWithEmailAndPassword(auth, email, password);

        res();
      });
    },
    Logout() {
      return new Promise((res) => {
        signOut(auth);
        res();
      });
    },
  };
}

export function AuthProvider({ children }) {
  const auth = useAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default function AuthConsumer() {
  return React.useContext(authContext);
}
