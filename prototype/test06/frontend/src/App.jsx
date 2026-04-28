import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { InputScreen } from "./pages/InputScreen.jsx";
import { ResultScreen } from "./pages/ResultScreen.jsx";
import { UploadScreen } from "./pages/UploadScreen.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<InputScreen />} />
      <Route path="/upload" element={<UploadScreen />} />
      <Route path="/result/:analysisId" element={<ResultScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
