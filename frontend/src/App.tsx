import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";
import MapScreen from "./pages/MapScreen";
import ReportDetail from "./pages/ReportDetail";
import Places from "./pages/Places";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import SosTracking from "./pages/SosTracking";
import PushToast from "./components/PushToast";
import { initNotifikasyonPush, koutePushPlanDevan } from "./push";

export default function App() {
  const [toast, setToast] = useState<{ tit: string; kò: string } | null>(null);

  useEffect(() => {
    initNotifikasyonPush();
    koutePushPlanDevan((tit, kò) => {
      setToast({ tit, kò });
      setTimeout(() => setToast(null), 6000);
    });
  }, []);

  return (
    <>
      {toast && <PushToast tit={toast.tit} kò={toast.kò} onFèmen={() => setToast(null)} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rapòte" element={<CreateReport />} />
        <Route path="/kat" element={<MapScreen />} />
        <Route path="/rapò/:id" element={<ReportDetail />} />
        <Route path="/sèvis" element={<Places />} />
        <Route path="/pwofil" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/swiv/:id" element={<SosTracking />} />
      </Routes>
    </>
  );
}
