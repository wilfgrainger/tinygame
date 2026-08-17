import './ui/styles.css';
import { boot } from './app/boot';

void boot();

if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js'); });
