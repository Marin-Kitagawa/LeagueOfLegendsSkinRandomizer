import { SkinPicker } from '@/components/skin-picker';
import { SpiritParticles } from '@/components/spirit-particles';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden animated-gradient">
      <SpiritParticles />
      <SkinPicker />
    </main>
  );
}
