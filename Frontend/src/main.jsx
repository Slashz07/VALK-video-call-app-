import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from './pages/LandingPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Authentication from './pages/Authentication.jsx';
import VideoCall from './pages/VideoCall.jsx';
import store from './store/store.js'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'
import MyAccount from './pages/MyAccount.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />
      },
      {
        path: "/home",
        element: <Home/>
      },
      {
        path: "/history",
        element: <History/>
      },
      {
        path: "/signIn",
        element: <Authentication />
      },
      {
        path: "/myAccount",
        element: <MyAccount />
      },
      {
        path: "/call/:url",
        element: <VideoCall />
      },
      {
        path: "*",
        element: <LandingPage />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  // </StrictMode>,
)
