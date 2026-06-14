import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const cfg = {
  apiKey:      import.meta.env.VITE_FB_API_KEY,
  authDomain:  import.meta.env.VITE_FB_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FB_DATABASE_URL,
  projectId:   import.meta.env.VITE_FB_PROJECT_ID,
  appId:       import.meta.env.VITE_FB_APP_ID,
};

export let db = null;
try {
  if (cfg.databaseURL) {
    const app = initializeApp(cfg);
    db = getDatabase(app);
  }
} catch (e) {
  console.warn('Firebase not configured — viewer count disabled');
}
