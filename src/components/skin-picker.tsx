"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Search, Sparkles, Dice5, Image as ImageIcon, Palette } from 'lucide-react';
import { getChampions, getChampionChromas, type Champion, type Skin, type Chroma, getSkinImageUrl, getLatestVersion } from '@/lib/champions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type SuggestedSkin = Skin & { imageUrl: string; championId: string };
type SuggestedChroma = Chroma & { imageUrl: string };

function ChromaDialogContent({ skin, champion, onGenerate, suggestedChromas, isLoading, count, setCount, maxChromas }: {
  skin: SuggestedSkin,
  champion: Champion,
  onGenerate: () => void,
  suggestedChromas: SuggestedChroma[],
  isLoading: boolean,
  count: number[],
  setCount: (value: number[]) => void,
  maxChromas: number,
}) {
  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="font-headline">Chromas for {skin.name}</DialogTitle>
        <DialogDescription>Select the number of random chromas you want to see.</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="chroma-count-slider" className="text-base font-headline">Number of Chromas</Label>
            <span className="font-semibold text-lg text-primary rounded-md bg-primary/10 px-3 py-1">{count[0]}</span>
          </div>
          <Slider
            id="chroma-count-slider"
            min={1}
            max={maxChromas}
            step={1}
            value={count}
            onValueChange={setCount}
            aria-label="Number of chromas slider"
          />
        </div>
        <Button onClick={onGenerate} size="lg" className="w-full font-headline tracking-wider" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Dice5 className="mr-2 h-5 w-5" />}
          Get Random Chromas
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: count[0] }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4 mx-auto rounded-md" />
            </div>
          ))}
        </div>
      )}

      {suggestedChromas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
          {suggestedChromas.map(chroma => (
            <div key={chroma.id} className="space-y-2 text-center animate-fade-in-up">
              <div className="relative aspect-square w-full">
                <Image src={chroma.imageUrl} alt={chroma.name} fill className="object-cover rounded-lg" unoptimized />
              </div>
              <p className="text-sm font-medium truncate">{chroma.name}</p>
            </div>
          ))}
        </div>
      )}
    </DialogContent>
  )
}

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
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  // States for Chroma Dialog
  const [chromaSkin, setChromaSkin] = useState<SuggestedSkin | null>(null);
  const [chromaCount, setChromaCount] = useState([1]);
  const [suggestedChromas, setSuggestedChromas] = useState<SuggestedChroma[]>([]);
  const [isLoadingChromas, setIsLoadingChromas] = useState(false);
  const [availableChromas, setAvailableChromas] = useState<Chroma[]>([]);
  const [maxChromas, setMaxChromas] = useState(1);

  useEffect(() => {
    async function fetchInitialData() {
      setIsFetchingChampions(true);
      try {
        const [champs, version] = await Promise.all([
            getChampions(),
            getLatestVersion()
        ]);
        setChampions(champs);
        setFilteredChampions(champs);
        setLatestVersion(version);
        
        const lastSelectedId = localStorage.getItem('selectedChampionId');
        if (lastSelectedId && champs.some(c => c.id === lastSelectedId)) {
          handleChampionChange(lastSelectedId, false);
        }
      } catch (e: any) {
        toast({
          title: 'Error fetching game data',
          description: e.message || 'Could not load champion data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingChampions(false);
      }
    }
    fetchInitialData();
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
  const logoUrl = latestVersion ? `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/4655.png` : '/logo.png';

  const handleChampionChange = (championId: string, saveToStorage = true) => {
    setSelectedChampionId(championId);
    if (saveToStorage) {
      localStorage.setItem('selectedChampionId', championId);
    }
    const champ = champions.find(c => c.id === championId);
    if (champ) {
        const newSkinCount = Math.min(skinCount[0], champ.skins.length);
        setSkinCount([newSkinCount]);
    } else {
        setSkinCount([1]);
    }
    setSuggestedSkins([]);
  };
  
  const handleRandomChampion = () => {
    if (champions.length > 0) {
      const randomIndex = Math.floor(Math.random() * champions.length);
      const randomChampion = champions[randomIndex];
      handleChampionChange(randomChampion.id);
    }
  };

  const handleSuggestSkins = () => {
    if (!selectedChampion) {
      toast({ title: 'No Champion Selected', description: 'Please select a champion first.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setSuggestedSkins([]);

    setTimeout(() => {
      const shuffledSkins = [...selectedChampion.skins].sort(() => 0.5 - Math.random());
      const skinsToSuggest = shuffledSkins.slice(0, skinCount[0]);

      const skinsWithImages = skinsToSuggest.map(skin => ({
        ...skin,
        championId: selectedChampion.id,
        imageUrl: getSkinImageUrl(selectedChampion.id, skin.num, 'loading'),
      }));

      setSuggestedSkins(skinsWithImages);
      setIsLoading(false);
    }, 500);
  };
  
  const handleChromaButtonClick = async (skin: SuggestedSkin) => {
    if (!selectedChampion) return;
    setChromaSkin(skin);
    setIsLoadingChromas(true);
    setSuggestedChromas([]);
    
    try {
      const allChromas = await getChampionChromas(selectedChampion.key);
      const chromasForSkin = allChromas.filter(c => c.skinId === skin.id);

      if (chromasForSkin.length === 0) {
        toast({ title: 'No Chromas Found', description: `No chromas were found for ${skin.name}.`, variant: 'destructive' });
        setAvailableChromas([]);
        setMaxChromas(1);
        setChromaCount([1]);
        return;
      }

      setAvailableChromas(chromasForSkin);
      setMaxChromas(chromasForSkin.length);
      setChromaCount([1]);
    } catch (e: any) {
      toast({ title: 'Error Fetching Chromas', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoadingChromas(false);
    }
  };

  const handleGenerateChromas = () => {
    if (!chromaSkin) return;
    setIsLoadingChromas(true);
    setSuggestedChromas([]);
    
    setTimeout(() => {
      const shuffled = [...availableChromas].sort(() => 0.5 - Math.random());
      const chromasToSuggest = shuffled.slice(0, chromaCount[0]);

      const chromasWithImages = chromasToSuggest.map(chroma => ({
        ...chroma,
        imageUrl: chroma.chromaPath
      }));

      setSuggestedChromas(chromasWithImages);
      setIsLoadingChromas(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-6xl space-y-8 z-10">
      <Card className="w-full animate-fade-in-up border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
        <CardHeader className="text-center items-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-inner shadow-primary/10 overflow-hidden">
             {latestVersion ? (
                <Image src={logoUrl} alt="Spirit Bonds Ahri Summoner Icon" width={80} height={80} unoptimized/>
              ) : (
                <Skeleton className="h-20 w-20 rounded-full" />
              )}
          </div>
          <CardTitle className="text-4xl font-headline tracking-wider text-primary">League Skin & Chroma Picker</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Get random suggestions for your favorite champions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="champion-select" className="text-base font-headline">Champion</Label>
            {isFetchingChampions ? (
              <Skeleton className="h-10 w-full" />
            ) : (
            <div className="flex items-center gap-2">
              <Select onValueChange={(value) => handleChampionChange(value)} value={selectedChampionId}>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRandomChampion} aria-label="Select Random Champion">
                      <Dice5 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Random Champion</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            )}
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="skin-count-slider" className="text-base font-headline">Number of Skins</Label>
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
          <Button onClick={handleSuggestSkins} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-headline tracking-wider shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30" disabled={isLoading || !selectedChampion || isFetchingChampions}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Get Random Skins
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: skinCount[0] }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-primary/20 bg-card/80">
              <Skeleton className="aspect-[9/16] w-full" />
              <CardHeader><Skeleton className="h-6 w-3/4 rounded-md" /></CardHeader>
              <CardFooter><Skeleton className="h-10 w-full rounded-md" /></CardFooter>
            </Card>
          ))}
        </div>
      )}

      {suggestedSkins.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {suggestedSkins.map((skin) => (
            <Card key={skin.id} className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-sm shadow-lg flex flex-col animate-fade-in-up">
              <div className="relative aspect-[9/16] w-full">
                <Image src={skin.imageUrl} alt={skin.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>
              <CardHeader className="flex-grow pt-8">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-2xl truncate font-headline">{skin.name}</CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{skin.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardFooter className="grid grid-cols-1 gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="font-headline">
                      {skin.tier && skin.tier.iconUrl ? (
                          <div className="relative w-5 h-5 mr-2 flex-shrink-0">
                            <Image src={skin.tier.iconUrl} alt={skin.tier.name} fill unoptimized className="object-contain" />
                          </div>
                        ) : (
                          <ImageIcon className="mr-2 h-4 w-4" />
                        )
                      }
                      Splash Art
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-5xl p-0 border-0">
                    <div className="relative aspect-video w-full">
                      <Image src={getSkinImageUrl(skin.championId, skin.num, 'splash')} alt={skin.name} fill className="object-cover rounded-lg" />
                    </div>
                  </DialogContent>
                </Dialog>

                {skin.chromas && selectedChampion && (
                  <Dialog onOpenChange={(open) => !open && setChromaSkin(null)}>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleChromaButtonClick(skin)} className="font-headline"><Palette className="mr-2 h-4 w-4" /> Chromas</Button>
                    </DialogTrigger>
                    {chromaSkin && chromaSkin.id === skin.id && (
                       <ChromaDialogContent
                        skin={chromaSkin}
                        champion={selectedChampion}
                        onGenerate={handleGenerateChromas}
                        suggestedChromas={suggestedChromas}
                        isLoading={isLoadingChromas}
                        count={chromaCount}
                        setCount={setChromaCount}
                        maxChromas={maxChromas}
                       />
                    )}
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
