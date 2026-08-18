import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Initialization is deferred to first use (not module load) so that `next build`'s
// page-data collection phase — which imports every route module just to inspect its
// config — doesn't crash when env vars aren't set yet (e.g. before Vercel env vars
// are configured). Real requests on Vercel always have the env vars by the time a
// route handler actually runs and calls db().
let app: App | undefined;

function getApp(): App {
  if (app) return app;
  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
  return app;
}

let firestore: Firestore | undefined;

export function getDb(): Firestore {
  if (!firestore) firestore = getFirestore(getApp());
  return firestore;
}
