import React, { useContext, useState } from 'react'
import "../App.css"
import CheckAuth from '../Utils/CheckAuth'
import { useNavigate } from 'react-router-dom'
import { Button, TextField } from '@mui/material'
import { AuthContext } from '../context/AuthContext'
import NavigationBar from '../Utils/NavigationBar.jsx'

function Home(props) {

  const [meetingCode, setMeetingCode] = useState("")
  const navigate = useNavigate()
  const {updateMeetingHistory}=useContext(AuthContext)

  const handleMeeting = () => {
    meetingCode!="" && updateMeetingHistory(meetingCode).then((isUpdated)=>{
      if(isUpdated){
        navigate(`/call/${meetingCode}`)
      }
    }).catch((err)=>console.log(err))
  }

  return (
    <>
    <NavigationBar/>
    <div className='meetContainer'>
      <div className='leftPanel'>
        <div>
          <h2>One Code Away from a World of Connections</h2>
          <div>
            <TextField
              margin="normal"
              required
              fullWidth
              id="meetingCode"
              label="MeetCode"
              name="meetingCode"
              autoFocus
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <Button variant='contained' 
             onClick={()=>handleMeeting()}
            >
              JOIN
            </Button>
          </div>
        </div>
      </div>
      <div className='rightPanel'>
        <img src="../../home.svg" alt="" />
      </div>
    </div>
    </>
    
  )
}

export default CheckAuth(Home)