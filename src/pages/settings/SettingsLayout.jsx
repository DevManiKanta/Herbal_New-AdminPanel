import SettingsSidebar from "./components/SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <SettingsSidebar />
        <div className="flex-1 p-8 bg-white">{children}</div>
      </div>
    </div>
  );
}
