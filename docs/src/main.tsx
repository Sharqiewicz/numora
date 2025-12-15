import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { getRouter } from './router'
import './styles.css'

const router = getRouter()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element "#root" not found')
}

createRoot(rootElement).render(<RouterProvider router={router} />)

