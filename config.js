import { createRequire } from "module";
const require = createRequire(import.meta.url);

var admin = require("firebase-admin");
var serviceAccountCafe = require("./goglobal2021-2775b-firebase-adminsdk-jvl1v-6c57893bb3.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountCafe),
    databaseURL: "https://goglobal2021-2775b-default-rtdb.firebaseio.com"
});
