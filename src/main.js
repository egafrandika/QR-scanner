import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Notifications from '@kyvg/vue3-notification'

import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from './firebase'

initializeApp(firebaseConfig);
getAnalytics();
const app = createApp(App)

app.use(router)
app.use(Notifications)

app.mount('#app')
