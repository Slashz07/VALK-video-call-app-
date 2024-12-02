import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom';
import NavigationBar from '../Utils/NavigationBar';

function LandingPage() {
  return (
    <div className='landingPageContainer'>
      <div className='landingPageMain'>
          <div className='getStarted'>
             <h1><span>Connect</span> with your <br/> Loved ones</h1>
             <p>Cover the distance with VALK</p>
             <button className='getStarted-button'>Get Started</button>
          </div>
          <div className='landingPageImage'>
              <img src="../../public/mobile.png" alt="" />
          </div>
      </div>
    </div>
  )
}

export default LandingPage