import admin from "firebase-admin"
import "dotenv/config";
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY)),
  databaseURL: process.env.DATABASE_URL
});

export const db = admin.database();