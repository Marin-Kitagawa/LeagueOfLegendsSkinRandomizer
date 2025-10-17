import { SkinPicker } from '@/components/skin-picker';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
      <div className="animated-gradient absolute inset-0 z-0"></div>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl"></div>
      <SkinPicker />
    </main>
  );
}
