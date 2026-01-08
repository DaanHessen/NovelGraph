import { redirect } from 'next/navigation';

export default function SettingsRootPage() {
  redirect('/editor/settings/account');
}
