import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CreatePage } from "./pages/CreatePage";
import { JoinManualPage } from "./pages/JoinManualPage";
import { EventPage } from "./pages/EventPage";
import { AlbumPage } from "./pages/AlbumPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="create" element={<CreatePage />} />
      <Route path="join" element={<JoinManualPage />} />
      <Route path="event/:id" element={<EventPage />} />
      <Route path="event/:id/album/:albumId" element={<AlbumPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="profile-setup" element={<ProfileSetupPage />} />
    </Routes>
  );
}
