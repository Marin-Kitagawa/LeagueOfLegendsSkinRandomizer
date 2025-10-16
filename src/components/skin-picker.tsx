"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Gem, Loader2 } from 'lucide-react';
import { champions, type Skin } from '@/lib/champions';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

type SuggestedSkin = Skin & { image: ImagePlaceholder };

export function SkinPicker() {
  const { toast } = useToast();
  const [selectedChampionId, setSelectedChampionId] = useState<string | undefined>();
  const [skinCount, setSkinCount] = useState([1]);
  const [suggestedSkins, setSuggestedSkins] = useState<SuggestedSkin[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedChampion = useMemo(() => champions.find(c => c.id === selectedChampionId), [selectedChampionId]);
  const maxSkins = selectedChampion ? selectedChampion.skins.length : 1;

  const handleChampionChange = (championId: string) => {
    setSelectedChampionId(championId);
    const champ = champions.find(c => c.id === championId);
    if (champ) {
        const newSkinCount = Math.min(skinCount[0], champ.skins.length);
        setSkinCount([newSkinCount]);
    } else {
        setSkinCount([1]);
    }
    setSuggestedSkins([]);
  };

  const handleSuggestSkins = () => {
    if (!selectedChampion) {
      toast({
        title: 'No Champion Selected',
        description: 'Please select a champion first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSuggestedSkins([]);

    setTimeout(() => {
      const shuffledSkins = [...selectedChampion.skins].sort(() => 0.5 - Math.random());
      const skinsToSuggest = shuffledSkins.slice(0, skinCount[0]);

      const skinsWithImages = skinsToSuggest.map(skin => {
        const image = PlaceHolderImages.find(p => p.id === skin.imageId);
        return {
          ...skin,
          image: image || { id: 'fallback', description: '', imageUrl: 'https://picsum.photos/seed/error/400/240', imageHint: 'error' },
        };
      });

      setSuggestedSkins(skinsWithImages);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Card className="w-full animate-fade-in-up shadow-2xl">
        <CardHeader className="text-center items-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gem className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Skin Picker</CardTitle>
          <CardDescription className="text-lg">Get random skin suggestions for your favorite champion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="champion-select" className="text-base">Champion</Label>
            <Select onValueChange={handleChampionChange} value={selectedChampionId}>
              <SelectTrigger id="champion-select" className="w-full text-base">
                <SelectValue placeholder="Select a champion..." />
              </SelectTrigger>
              <SelectContent>
                {champions.map((champion) => (
                  <SelectItem key={champion.id} value={champion.id} className="text-base">
                    {champion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="skin-count-slider" className="text-base">Number of Skins</Label>
                <span className="font-semibold text-lg text-primary rounded-md bg-primary/10 px-3 py-1">{skinCount[0]}</span>
            </div>
            <Slider
              id="skin-count-slider"
              min={1}
              max={maxSkins}
              step={1}
              value={skinCount}
              onValueChange={setSkinCount}
              disabled={!selectedChampion}
              aria-label="Number of skins slider"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSuggestSkins} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold" disabled={isLoading || !selectedChampion}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Get Skins
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: skinCount[0] }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-[400/240] w-full" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {suggestedSkins.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {suggestedSkins.map((skin) => (
            <Card key={skin.name} className="overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-primary/30">
              <div className="relative aspect-[400/240] w-full">
                <Image
                  src={skin.image.imageUrl}
                  alt={skin.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  data-ai-hint={skin.image.imageHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{skin.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
