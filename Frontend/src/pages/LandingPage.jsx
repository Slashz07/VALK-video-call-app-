import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom';
import NavigationBar from '../Utils/NavigationBar';

function LandingPage() {
  return (
    <>
    <NavigationBar/>
      <div className='landingPageContainer'>
      <div className='landingPageMain'>
          <div className='getStarted'>
             <h1><span>Connect</span> with your <br/> Loved ones</h1>
             <p>Cover the distance with VALK</p>
             <Link to={"/signIn"}>
             <button className='getStarted-button'>Get Started</button>
             </Link>
          </div>
          <div className='landingPageImage'>
              <img src="../../public/mobile.png" alt="" />
          </div>
      </div>
    </div>
    </>
  
  )
}

export default LandingPage