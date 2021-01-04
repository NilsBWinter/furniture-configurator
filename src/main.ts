import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import Oruga from '@oruga-ui/oruga-next';
import { mdiChevronDown } from '@mdi/js';
import { iconMdi, registerIcons } from './Icons';
import '@oruga-ui/oruga-next/dist/oruga.css';


const app = createApp(App);
app.use(store);
app.use(Oruga, {
	iconComponent: 'icon-mdi',
	iconPack: 'mdijs',
	customIconPacks: {
		mdijs: {
			iconPrefix: 'mdi-',
		},
	},
});
app.component('icon-mdi', iconMdi);

// These are used by oruga
registerIcons({
    mdiCaretDown: mdiChevronDown,
});

app.use(router)

app.mount('#app');
