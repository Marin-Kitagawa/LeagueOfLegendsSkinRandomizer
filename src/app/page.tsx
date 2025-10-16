import { SkinPicker } from '@/components/skin-picker';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 md:p-8 lg:p-12 bg-muted/40">
      <SkinPicker />
    </main>
  );
}
