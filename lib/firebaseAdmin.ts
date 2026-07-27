import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("../firebase-admin.json");

const adminApp =
  getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });

export const adminDb = getFirestore(adminApp);