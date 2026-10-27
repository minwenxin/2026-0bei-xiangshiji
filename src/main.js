import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js'
import './styles/style.css'
import './styles/redesign.css'
import './styles/map.css'
import './styles/formal.css'

createApp(App).use(router).mount('#app')
