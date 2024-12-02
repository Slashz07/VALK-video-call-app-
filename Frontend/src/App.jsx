import './App.css'
import { Outlet } from 'react-router-dom'
import NavigationBar from './Utils/NavigationBar'
import Footer from './Utils/Footer'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from './context/AuthContext'
import { useDispatch } from 'react-redux'
import { login, logout } from './reduxFeatures/AuthSlice'

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
      <NavigationBar />
      <div className='mainContent'>
      {console.log(loading)}
      {
        loading ?
          <h2 style={{
            display: "flex", justifyContent: "center",
            alignItems: "center"
          }}>Loading...</h2> :
          <Outlet />
      }
      </div>
      
      <Footer />
    </div>
  )
}

export default App
