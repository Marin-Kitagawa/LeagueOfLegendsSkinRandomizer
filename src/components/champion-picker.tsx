
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Search, Sparkles, Dice5, Image as ImageIcon, Palette, SlidersHorizontal, Users } from 'lucide-react';
import { getChampions, getChampionChromas, type Champion, type Skin, type Chroma, getSkinImageUrl, getLatestVersion } from '@/lib/champions';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type SuggestedChroma = Chroma & { imageUrl: string };

const CHAMPION_ROLES = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];
const DDRAGON_URL = 'https://ddragon.leagueoflegends.com';

const ROLE_COLORS: { [key: string]: string } = {
  Assassin: 'bg-red-500/80 hover:bg-red-500',
  Fighter: 'bg-orange-500/80 hover:bg-orange-500',
  Mage: 'bg-blue-500/80 hover:bg-blue-500',
  Marksman: 'bg-yellow-500/80 hover:bg-yellow-500',
  Support: 'bg-green-500/80 hover:bg-green-500',
  Tank: 'bg-gray-500/80 hover:bg-gray-500',
};

function ViewSkinsDialog({ champion }: { champion: Champion }) {
  const [isLoadingChromas, setIsLoadingChromas] = useState(false);
  const [chromaList, setChromaList] = useState<SuggestedChroma[]>([]);
  const [selectedSkinForChroma, setSelectedSkinForChroma] = useState<Skin | null>(null);
  const { toast } = useToast();

  const handleFetchChromas = async (skin: Skin) => {
    if (!champion) return;
    setSelectedSkinForChroma(skin);
    setIsLoadingChromas(true);
    setChromaList([]);

    try {
      const allChromas = await getChampionChromas(champion.key);
      const chromasForSkin = allChromas.filter(c => c.skinId === skin.id);

      if (chromasForSkin.length === 0) {
        toast({ title: 'No Chromas Found', description: `No chromas were found for ${skin.name}.`, variant: 'destructive' });
        return;
      }
      
      const chromasWithImages = chromasForSkin.map(chroma => ({
        ...chroma,
        imageUrl: chroma.chromaPath
      }));

      setChromaList(chromasWithImages);
    } catch (e: any) {
      toast({ title: 'Error Fetching Chromas', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoadingChromas(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle className="font-headline">Skins for {champion.name}</DialogTitle>
        <DialogDescription>All available skins for this champion.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {champion.skins.map(skin => (
            <Card key={skin.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-[9/16] w-full">
                <Image src={getSkinImageUrl(champion.id, skin.num, 'loading')} alt={skin.name} fill className="object-cover" sizes="33vw" />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl font-headline">{skin.name}</CardTitle>
                {skin.tier && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {skin.tier.iconUrl && <Image src={skin.tier.iconUrl} alt={skin.tier.name} width={16} height={16} unoptimized />}
                    <span>{skin.tier.name}</span>
                  </div>
                )}
              </CardHeader>
              <CardFooter className="grid grid-cols-2 gap-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><ImageIcon className="mr-2 h-4 w-4" /> Splash</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-5xl p-0 border-0">
                         <div className="relative aspect-video w-full">
                            <Image src={getSkinImageUrl(champion.id, skin.num, 'splash')} alt={skin.name} fill className="object-cover rounded-lg" />
                        </div>
                    </DialogContent>
                 </Dialog>

                {skin.chromas && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" onClick={() => handleFetchChromas(skin)}><Palette className="mr-2 h-4 w-4" /> Chromas</Button>
                    </DialogTrigger>
                    {selectedSkinForChroma?.id === skin.id && (
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="font-headline">Chromas for {skin.name}</DialogTitle>
                        </DialogHeader>
                        {isLoadingChromas ? <Loader2 className="mx-auto h-10 w-10 animate-spin" /> : (
                           <ScrollArea className="max-h-[60vh]">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                              {chromaList.map(chroma => (
                                <div key={chroma.id} className="space-y-2 text-center">
                                  <div className="relative aspect-square w-full">
                                    <Image src={chroma.imageUrl} alt={chroma.name} fill className="object-cover rounded-lg" unoptimized />
                                  </div>
                                </div>
                              ))}
                            </div>
                           </ScrollArea>
                        )}
                      </DialogContent>
                    )}
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}


export function ChampionPicker() {
  const { toast } = useToast();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [championCount, setChampionCount] = useState([1]);
  const [suggestedChampions, setSuggestedChampions] = useState<Champion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingChampions, setIsFetchingChampions] = useState(true);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      setIsFetchingChampions(true);
      try {
        const [champs, version] = await Promise.all([getChampions(), getLatestVersion()]);
        setChampions(champs);
        setFilteredChampions(champs);
        setLatestVersion(version);
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
    const newlyFiltered = champions.filter(champion => {
      const matchesSearch = champion.name.toLowerCase().includes(lowerCaseSearch);
      const matchesRole = selectedRoles.length === 0 || selectedRoles.some(role => champion.tags.includes(role));
      return matchesSearch && matchesRole;
    });
    setFilteredChampions(newlyFiltered);
  }, [searchTerm, selectedRoles, champions]);

  const maxChampions = filteredChampions.length > 0 ? filteredChampions.length : 1;
  const logoUrl = latestVersion ? `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/4655.png` : '/logo.png';

  useEffect(() => {
    if (championCount[0] > maxChampions) {
      setChampionCount([maxChampions > 0 ? maxChampions : 1]);
    }
  }, [maxChampions, championCount]);
  
  const handleSuggestChampions = () => {
    if (filteredChampions.length === 0) {
      toast({ title: 'No Matching Champions', description: 'No champions match your current filters.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setSuggestedChampions([]);

    setTimeout(() => {
      const shuffled = [...filteredChampions].sort(() => 0.5 - Math.random());
      const champsToSuggest = shuffled.slice(0, championCount[0]);
      setSuggestedChampions(champsToSuggest);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-6xl space-y-8 z-10">
      <Card className="w-full animate-fade-in-up border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
        <CardHeader className="text-center items-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-inner shadow-primary/10 overflow-hidden">
             {latestVersion ? (
                <Image src={logoUrl} alt="Spirit Blossom Ahri Summoner Icon" width={80} height={80} unoptimized/>
              ) : (
                <Skeleton className="h-20 w-20 rounded-full" />
              )}
          </div>
          <CardTitle className="text-4xl font-headline tracking-wider text-primary">Champion Picker</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Get random champions based on your preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4 pt-2">
             <div className="flex justify-between items-center gap-4">
                <div className='flex-grow space-y-2'>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="champion-count-slider" className="text-base font-headline">Number of Champions</Label>
                        <span className="font-semibold text-lg text-primary rounded-md bg-primary/10 px-3 py-1">{championCount[0]}</span>
                    </div>
                    <Slider
                      id="champion-count-slider"
                      min={1}
                      max={maxChampions}
                      step={1}
                      value={championCount}
                      onValueChange={setChampionCount}
                      disabled={isFetchingChampions || filteredChampions.length === 0}
                      aria-label="Number of champions slider"
                    />
                </div>
                <div className="flex-shrink-0">
                    <DropdownMenu>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" aria-label="Filter Champions by Role">
                                            <SlidersHorizontal className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Filter by Role</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Champion Roles</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {CHAMPION_ROLES.map(role => (
                                <DropdownMenuCheckboxItem
                                    key={role}
                                    checked={selectedRoles.includes(role)}
                                    onCheckedChange={() => {
                                        setSelectedRoles(prev => 
                                            prev.includes(role) ? prev.filter(t => t !== role) : [...prev, role]
                                        )
                                    }}
                                >
                                    {role}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button onClick={handleSuggestChampions} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-headline tracking-wider shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30" disabled={isLoading || isFetchingChampions}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Get Random Champions
          </Button>
           <Link href="/league-skin-picker" passHref>
              <Button variant="link" className="font-headline text-primary">
                Go to Skin & Chroma Picker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: championCount[0] }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-primary/20 bg-card/80">
              <Skeleton className="aspect-[9/16] w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardFooter><Skeleton className="h-10 w-full rounded-md" /></CardFooter>
            </Card>
          ))}
        </div>
      )}

      {suggestedChampions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {suggestedChampions.map((champion) => (
            <Card key={champion.id} className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-sm shadow-lg flex flex-col animate-fade-in-up">
              <Dialog>
                <DialogTrigger asChild>
                    <div className="relative aspect-[9/16] w-full cursor-pointer">
                        <Image src={getSkinImageUrl(champion.id, 0, 'loading')} alt={champion.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl p-0 border-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{champion.name} Splash Art</DialogTitle>
                    </DialogHeader>
                    <div className="relative aspect-video w-full">
                        <Image src={getSkinImageUrl(champion.id, 0, 'splash')} alt={`${champion.name} Splash Art`} fill className="object-cover rounded-lg" />
                    </div>
                </DialogContent>
              </Dialog>
              <CardHeader className="flex-grow pt-4">
                 <CardTitle className="text-2xl font-headline py-2">{champion.name}</CardTitle>
                 <div className="flex flex-wrap gap-2">
                    {champion.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className={`${ROLE_COLORS[tag] || 'bg-gray-400'} text-white`}>{tag}</Badge>
                    ))}
                 </div>
              </CardHeader>
              <CardFooter>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full font-headline"><Users className="mr-2 h-4 w-4" /> View Skins</Button>
                    </DialogTrigger>
                    <ViewSkinsDialog champion={champion} />
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
