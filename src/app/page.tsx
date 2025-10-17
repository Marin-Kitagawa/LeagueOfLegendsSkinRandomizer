import { SkinPicker } from '@/components/skin-picker';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background bg-dot-white/[0.2] p-4 md:p-8 lg:p-12">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <SkinPicker />
    </main>
  );
}
