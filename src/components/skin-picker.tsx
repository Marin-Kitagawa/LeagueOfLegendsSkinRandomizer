"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Gem, Loader2, Search, Sparkles } from 'lucide-react';
import { getChampions, getSkinImageUrl, type Champion, type Skin } from '@/lib/champions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

type SuggestedSkin = Skin & { imageUrl: string; fullImageUrl: string };

export function SkinPicker() {
  const { toast } = useToast();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChampionId, setSelectedChampionId] = useState<string | undefined>();
  const [skinCount, setSkinCount] = useState([1]);
  const [suggestedSkins, setSuggestedSkins] = useState<SuggestedSkin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingChampions, setIsFetchingChampions] = useState(true);

  useEffect(() => {
    async function fetchChampions() {
      setIsFetchingChampions(true);
      try {
        const champs = await getChampions();
        setChampions(champs);
        setFilteredChampions(champs);
      } catch (e: any) {
        toast({
          title: 'Error fetching champions',
          description: e.message || 'Could not load champion data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingChampions(false);
      }
    }
    fetchChampions();
  }, [toast]);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = champions.filter(champion =>
      champion.name.toLowerCase().includes(lowerCaseSearch)
    );
    setFilteredChampions(filtered);
  }, [searchTerm, champions]);


  const selectedChampion = useMemo(() => champions.find(c => c.id === selectedChampionId), [selectedChampionId, champions]);
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

    // We add a small delay to show the loading state, feels more responsive
    setTimeout(() => {
      const shuffledSkins = [...selectedChampion.skins].sort(() => 0.5 - Math.random());
      const skinsToSuggest = shuffledSkins.slice(0, skinCount[0]);

      const skinsWithImages = skinsToSuggest.map(skin => ({
        ...skin,
        imageUrl: getSkinImageUrl(selectedChampion.id, skin.num, 'loading'),
        fullImageUrl: getSkinImageUrl(selectedChampion.id, skin.num, 'splash'),
      }));

      setSuggestedSkins(skinsWithImages);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl space-y-8 z-10">
      <Card className="w-full animate-fade-in-up border-primary/20 bg-background/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
        <CardHeader className="text-center items-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-inner shadow-primary/10">
            <Gem className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Skin Picker</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Get random skin suggestions for your favorite champion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="champion-select" className="text-base">Champion</Label>
            {isFetchingChampions ? (
              <Skeleton className="h-10 w-full" />
            ) : (
            <Select onValueChange={handleChampionChange} value={selectedChampionId}>
              <SelectTrigger id="champion-select" className="w-full text-base">
                <SelectValue placeholder="Select a champion..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search champion..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  {filteredChampions.map((champion) => (
                    <SelectItem key={champion.id} value={champion.id} className="text-base">
                      {champion.name}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            )}
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
              disabled={!selectedChampion || isFetchingChampions}
              aria-label="Number of skins slider"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSuggestSkins} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30" disabled={isLoading || !selectedChampion || isFetchingChampions}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Get Skins
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: skinCount[0] }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-primary/20 bg-background/80">
                <Skeleton className="aspect-[9/16] w-full" />
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
            <Dialog key={skin.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden border-primary/20 bg-background/80 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-primary/20 cursor-pointer">
                  <div className="relative aspect-[9/16] w-full">
                    <Image
                      src={skin.imageUrl}
                      alt={skin.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl truncate">{skin.name}</CardTitle>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl p-0 border-0">
                  <div className="relative aspect-video w-full">
                      <Image
                        src={skin.fullImageUrl}
                        alt={skin.name}
                        fill
                        className="object-contain rounded-lg"
                      />
                  </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
