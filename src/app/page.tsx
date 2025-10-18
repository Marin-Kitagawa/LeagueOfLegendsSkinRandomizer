
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden animated-gradient">
      <div className="absolute inset-0 z-0">
        {/* You can keep PetalDrift or ButterflySwarm here if you want them on the home page */}
      </div>
      <Card className="w-full max-w-2xl z-10 animate-fade-in-up border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
         <CardHeader className="text-center items-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-inner shadow-primary/10 overflow-hidden">
                <Image src="https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/4655.png" alt="Spirit Blossom Ahri Summoner Icon" width={80} height={80} unoptimized/>
            </div>
            <CardTitle className="text-4xl font-headline tracking-wider text-primary">League Tools</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Choose your tool</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center p-6">
          <Link href="/champion-picker" passHref>
            <Button size="lg" className="w-full text-lg font-headline tracking-wider">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Champion Picker
            </Button>
          </Link>
          <Link href="/league-skin-picker" passHref>
            <Button size="lg" className="w-full text-lg font-headline tracking-wider">
              League Skin & Chroma Picker
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
