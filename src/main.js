import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VueFeather from 'vue-feather'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'


const app = createApp(App)
app.component(VueFeather.name, VueFeather)

const options = {
    position: "top-right",
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: true,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
    style: {
        background: "#1E1E2F",
        color: "#F5F5F5",     
        border: "1px solid #2A2A40",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontSize: "14px"
    },
    success: {
        style: {
            background: "#1E2F24",
            border: "1px solid #2F6240",
            color: "#B5F7C4"
        },
        iconTheme: {
            primary: "#4CAF50",
            secondary: "#FFFFFF"
        }
    },
    error: {
        style: {
            background: "#2F1E1E",
            border: "1px solid #623030",
            color: "#F7B5B5"
        },
        iconTheme: {
            primary: "#F44336",
            secondary: "#FFFFFF"
        }
    },
    warning: {
        style: {
            background: "#2F2A1E",
            border: "1px solid #625830",
            color: "#F7E1B5"
        },
        iconTheme: {
            primary: "#FFC107",
            secondary: "#FFFFFF"
        }
    }
};


app.use(router)
app.use(Toast, options) 

app.mount('#app')
