// RUTA: src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB7fxtwAT9wJYCee1tpcbq-9v69IDUaykE",
    authDomain: "clima-309e2.firebaseapp.com",
    projectId: "clima-309e2",
    storageBucket: "clima-309e2.appspot.com",
    messagingSenderId: "130584572417",
    appId: "1:130584572417:web:064a5a3921fe41a5700600"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);