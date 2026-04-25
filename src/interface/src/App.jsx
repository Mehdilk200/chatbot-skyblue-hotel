import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Assistant from './pages/Assistant';
import AdminRooms from './pages/AdminRooms';
import AdminOperations from './pages/AdminOperations';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/rooms" element={<AdminRooms />} />
        <Route path="/admin/operations" element={<AdminOperations />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
