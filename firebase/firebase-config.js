import admin from "firebase-admin"
import "dotenv/config";
import {serviceAccount } from "./service-account.js"
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

export const db = admin.database();