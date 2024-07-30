import firebase from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import "@firebase/storage";

const config ={
    the config info. you get from your fir base project
};

firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();
export const storage = firebase.storage();