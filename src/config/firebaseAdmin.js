import admin from 'firebase-admin';
import serviceAccount from "../data/shoe-box-e5b38-firebase-adminsdk-fbsvc-dd085789c1.json"  with {type: "json"};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

export default admin;