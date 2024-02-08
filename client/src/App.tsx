import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signup from './components/Signup';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Signup />} />
        {/* <Route path="/signin" element={<Signin/>}/>
        <Route path="/todolist" element={<Todolist/>}/> */}
      </Routes>
    </Router>
  )
}

export default App
