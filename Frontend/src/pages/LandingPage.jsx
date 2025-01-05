import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom';
import NavigationBar from '../Utils/NavigationBar';
import { useSelector } from 'react-redux';

function LandingPage() {
  const status=useSelector((state)=>state.auth.status)
  return (
    <>
      <NavigationBar />
      <div className='landingPageContainer'>
        <div className='landingPageMain'>
          <div className='getStarted'>
            <h1><span>Connect</span> with your <br /> Loved ones</h1>
            <p>Cover the distance with VALK</p>
            <Link to={status?"/home":"/signIn"}>
              <button className='getStarted-button'>Get Started</button>
            </Link>
          </div>
          <div className='landingPageImage'>
            <img src="/mobile.png" alt="" />
          </div>
        </div>
      </div>
    </>

  )
}

export default LandingPage