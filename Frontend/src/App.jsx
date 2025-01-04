import './App.css'
import { Outlet } from 'react-router-dom'
import Footer from './Utils/Footer'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from './context/AuthContext'
import { useDispatch } from 'react-redux'
import { login, logout } from './reduxFeatures/AuthSlice'
import { ToastContainer } from 'react-toastify'

function App() {
  const { verifyLogin } = useContext(AuthContext)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyLogin()
      .then((user) => {
        // user.statusCode === httpStatus.OK ?
        dispatch(login({ userData: user.data }))
        setLoading(false)
        //  : dispatch(logout())
      }
      )
      .catch((error) => {
        setLoading(false)
        dispatch(logout())
      })
  })

  return (
    <div className='mainContainer'>
      <div className='mainContent'>
    <ToastContainer style={{marginTop:"6rem"}}/>
        {console.log(loading)}
        {
          loading ?
            <div style={{
              height: "80vh",
              display: "flex", justifyContent: "center",
              alignItems: "center",
              backgroundColor:"black"
            }}>
              <h2 style={{color:"white"}}>Loading...</h2>
            </div>
            :
            <Outlet />
        }
      </div>

      <Footer />
    </div>
  )
}

export default App
