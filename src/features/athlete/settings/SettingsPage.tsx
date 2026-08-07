import SettingsHero from "./components/SettingsHero";
import ProfileSettings from "./components/ProfileSettings";
import TrainingPreferences from "./components/TrainingPreferences";
import NotificationSettings from "./components/NotificationSettings";
import AppearanceSettings from "./components/AppearanceSettings";
import AccountSecurity from "./components/AccountSecurity";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <SettingsHero />

      <ProfileSettings />

      <TrainingPreferences />

      <NotificationSettings />

      <AppearanceSettings />

      <AccountSecurity />
    </div>
  );
}