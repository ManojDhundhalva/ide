import { Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import config from "./config";
import Auth from "./pages/Auth";
import HomePage from "./pages/HomePage";
import WorkspacePage from "./pages/WorkspacePage";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const GoogleAuthWrapper = () => {
  return (
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
      <Auth />
    </GoogleOAuthProvider>
  );
};

const App = () => {

  return (
    <>
      <Routes>
        <Route exact path="/auth" element={<GoogleAuthWrapper />} />
        <Route exact path="/" element={<ProtectedRoute Component={HomePage} />} />
        <Route exact path="/:id" element={<ProtectedRoute Component={WorkspacePage} />} />
        <Route exact path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

export default App;
