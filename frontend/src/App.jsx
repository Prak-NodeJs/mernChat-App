import { useState } from 'react'
import './App.css'
import { Button, ButtonGroup } from '@chakra-ui/react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import HomePage from './Pages/HomePage'
import ChatPage from './Pages/ChatPage'
function App() {

  return (
    <div>
      <Routes>
      <Route path="/" element= {<HomePage></HomePage>}/>
      <Route path="/chats" element={<ChatPage/>}/>
        
        </Routes>
     
    </div>
  )
}

export default App
