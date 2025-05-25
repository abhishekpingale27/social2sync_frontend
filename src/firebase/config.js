import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Print Firebase configuration for debugging
console.log('Firebase configuration:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
  measurementId: firebaseConfig.measurementId ? '✓ Set' : '✗ Missing',
});

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

  if (missingFields.length > 0) {
    console.error(`Firebase initialization error: Missing required fields: ${missingFields.join(', ')}`);
    console.error('Please check your .env file or Vercel environment variables and ensure all Firebase configuration variables are set correctly.');
    return false;
  }
  return true;
};

// Initialize Firebase
let app;
let auth;

try {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Set persistence to LOCAL to keep user logged in across sessions
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Firebase persistence set to LOCAL - user will stay logged in');

        // Add auth state change listener for debugging
        auth.onAuthStateChanged((user) => {
          if (user) {
            console.log('Firebase auth state changed: User is signed in', user.uid);
            // Refresh token to ensure validity
            user.getIdToken(true)
              .then(token => {
                console.log('Successfully refreshed token, length:', token.length);
              })
              .catch(error => {
                console.error('Error refreshing token:', error);
              });
          } else {
            console.log('Firebase auth state changed: User is signed out');
          }
        });
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    console.log('Firebase initialized successfully');
    console.log('Auth domain:', firebaseConfig.authDomain);
  } else {
    console.error('Firebase initialization skipped due to missing configuration');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth };
export default app;