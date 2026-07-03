import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ChatApp from './ChatApp'

const root = document.getElementById('app')
createRoot(root).render(
    <BrowserRouter>
        <ChatApp />
    </BrowserRouter>
)