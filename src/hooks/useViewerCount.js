import { useEffect, useState, useRef } from 'react';
import { ref, set, remove, onValue, onDisconnect } from 'firebase/database';
import { db } from '../firebase.js';

function getViewerId() {
  let id = sessionStorage.getItem('_vid');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('_vid', id);
  }
  return id;
}

export function useViewerCount(channelId) {
  const [count, setCount] = useState(null);
  const presRef = useRef(null);

  useEffect(() => {
    if (!db || !channelId) { setCount(null); return; }

    const vid   = getViewerId();
    const chKey = `ch_${channelId}`;

    // Register this viewer
    presRef.current = ref(db, `viewers/${chKey}/${vid}`);
    set(presRef.current, { t: Date.now() });
    onDisconnect(presRef.current).remove();  // auto-remove on close/refresh

    // Listen to total count
    const countRef = ref(db, `viewers/${chKey}`);
    const unsub = onValue(countRef, snap => {
      setCount(snap.exists() ? Object.keys(snap.val()).length : 0);
    });

    return () => {
      unsub();
      if (presRef.current) remove(presRef.current);
      presRef.current = null;
    };
  }, [channelId]);

  return count;
}
