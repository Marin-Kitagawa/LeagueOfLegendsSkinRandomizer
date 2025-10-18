
import { LeagueSkinPicker } from '@/components/league-skin-picker';
import { PetalDrift } from '@/components/petal-drift';

export default function LeagueSkinPickerPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden animated-gradient">
      <PetalDrift />
      <LeagueSkinPicker />
    </main>
  );
}
