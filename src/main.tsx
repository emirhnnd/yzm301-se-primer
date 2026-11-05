import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import PariteSayfasi from './pages/PariteSayfasi.tsx';
import './index.css';

const parite = new URLSearchParams(window.location.search).get('parite') === '1';

createRoot(document.getElementById('root')!).render(parite ? <PariteSayfasi /> : <App />);
