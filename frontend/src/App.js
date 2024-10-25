// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
// import SomeOtherComponent from './SomeOtherComponent';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* <Route path="/some-other-page" element={<SomeOtherComponent />} /> */}
    </Routes>
  );
}

export default App;
