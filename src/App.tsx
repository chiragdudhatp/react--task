import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/Home';
const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App