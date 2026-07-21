import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CreatePage } from "./pages/CreatePage";
import { JoinManualPage } from "./pages/JoinManualPage";
import { EventPage } from "./pages/EventPage";
import { AlbumPage } from "./pages/AlbumPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import {
  ProfileNotificationsPage,
  ProfilePrivacyPage,
  ProfileHelpPage,
} from "./pages/ProfileSubPages";
import { LoginPage } from "./pages/LoginPage";
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
      <Route path="profile/edit" element={<ProfileEditPage />} />
      <Route path="profile/notifications" element={<ProfileNotificationsPage />} />
      <Route path="profile/privacy" element={<ProfilePrivacyPage />} />
      <Route path="profile/help" element={<ProfileHelpPage />} />
      <Route path="profile-setup" element={<ProfileSetupPage />} />
      <Route path="login" element={<LoginPage />} />
    </Routes>
  );
}
