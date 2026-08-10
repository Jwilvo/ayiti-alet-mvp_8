import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";
import MapScreen from "./pages/MapScreen";
import ReportDetail from "./pages/ReportDetail";
import Places from "./pages/Places";
import Admin from "./pages/Admin";
import SosTracking from "./pages/SosTracking";
import Alèt from "./pages/Alet";
import Nouvèl from "./pages/Nouvel";
import Meni from "./pages/Meni";
import Reglaj from "./pages/meni/Reglaj";
import Kont from "./pages/meni/Kont";
import ReglajAlèt from "./pages/meni/ReglajAlet";
import VizyalizasyonMap from "./pages/meni/VizyalizasyonMap";
import NouvèlReglaj from "./pages/meni/NouvelReglaj";
import Aparans from "./pages/meni/Aparans";
import Tèm from "./pages/meni/Tem";
import Politik from "./pages/meni/Politik";
import PwofilSekirite from "./pages/meni/PwofilSekirite";
import LyeMwYo from "./pages/meni/LyeMwYo";
import Group from "./pages/meni/Group";
import EnviteZanmiw from "./pages/meni/EnviteZanmiw";
import Blog from "./pages/meni/Blog";
import Sijesyon from "./pages/meni/Sijesyon";
import GidKominotè from "./pages/meni/GidKominote";
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
        <Route path="/alèt" element={<Alèt />} />
        <Route path="/nouvèl" element={<Nouvèl />} />
        <Route path="/meni" element={<Meni />} />
        <Route path="/meni/reglaj" element={<Reglaj />} />
        <Route path="/meni/reglaj/kont" element={<Kont />} />
        <Route path="/meni/reglaj/alèt" element={<ReglajAlèt />} />
        <Route path="/meni/reglaj/kat" element={<VizyalizasyonMap />} />
        <Route path="/meni/reglaj/nouvèl" element={<NouvèlReglaj />} />
        <Route path="/meni/reglaj/aparans" element={<Aparans />} />
        <Route path="/meni/reglaj/tèm" element={<Tèm />} />
        <Route path="/meni/reglaj/politik" element={<Politik />} />
        <Route path="/meni/pwofil-sekirite" element={<PwofilSekirite />} />
        <Route path="/meni/lye-mw-yo" element={<LyeMwYo />} />
        <Route path="/meni/group" element={<Group />} />
        <Route path="/meni/envite" element={<EnviteZanmiw />} />
        <Route path="/meni/blog" element={<Blog />} />
        <Route path="/meni/sijesyon" element={<Sijesyon />} />
        <Route path="/meni/gid-kominotè" element={<GidKominotè />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/swiv/:id" element={<SosTracking />} />
      </Routes>
    </>
  );
}
