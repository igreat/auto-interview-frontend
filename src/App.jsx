import Home from './Home';
import Interview from './Interview';
// import VideoRecorder from './VideoRecorder';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
        {/* <Route path="/video-recorder" element={<VideoRecorder />} /> */}
      </Routes>
    </Router>
  );
}

export default App;