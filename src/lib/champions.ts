
import { getSkinTier, type SkinTier } from '@/lib/skintiers';

const DDRAGON_URL = 'https://ddragon.leagueoflegends.com';
const CDRAGON_URL = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default';


export type Chroma = {
  id: string;
  name: string;
  chromaPath: string;
  skinId: string;
};

export type Skin = {
  id: string;
  name: string;
  num: number;
  chromas: boolean;
  tier: SkinTier | null;
};

export type Champion = {
  id: string;
  key: string;
  name: string;
  skins: Skin[];
  title: string;
};

type ChampionFullData = {
    type: string;
    format: string;
    version: string;
    data: {
        [key: string]: {
            id: string;
            key: string;
            name: string;
            title: string;
            skins: {
                id: string;
                num: number;
                name: string;
                chromas: boolean;
            }[];
        }
    };
}

type CommunityDragonChampion = {
  id: number;
  name: string;
  skins: {
    id: number;
    name: string;
    chromas?: {
      id: number;
      name: string;
      chromaPath: string;
    }[];
  }[];
}

type CdragonSkinData = {
    id: number;
    name: string;
    description: string | null;
    splashPath: string;
    uncenteredSplashPath: string;
    tilePath: string;
    loadScreenPath: string;
    skinType: string;
    rarity: string;
    isLegacy: boolean;
    chromaPath: string | null;
    chromas: {
        id: number;
        name: string;
        chromaPath: string;
        colors: string[];
    }[] | null;
    featuresText: string | null;
};

const getSkinTiers = async (): Promise<Record<string, CdragonSkinData>> => {
    try {
        const response = await fetch(`${CDRAGON_URL}/v1/skins.json`, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error(`Failed to fetch skin tiers: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching skin tiers from Community Dragon:", error);
        throw new Error('Could not retrieve skin tier data.');
    }
};

export const getLatestVersion = async (): Promise<string> => {
    try {
        const versionsResponse = await fetch(`${DDRAGON_URL}/api/versions.json`, { next: { revalidate: 3600 } });
        if (!versionsResponse.ok) {
            throw new Error(`Failed to fetch versions: ${versionsResponse.statusText}`);
        }
        const versions = await versionsResponse.json();
        return versions[0];
    } catch (error) {
        console.error("Error fetching latest version from Data Dragon:", error);
        throw new Error('Could not retrieve latest version from the official API.');
    }
}

export function getSkinImageUrl(championId: string, skinNum: number, type: 'splash' | 'loading' = 'splash') {
  return `${DDRAGON_URL}/cdn/img/champion/${type}/${championId}_${skinNum}.jpg`;
}

export const getChampions = async (): Promise<Champion[]> => {
    try {
      const [latestVersion, skinTiers] = await Promise.all([
          getLatestVersion(),
          getSkinTiers()
      ]);

      const response = await fetch(`${DDRAGON_URL}/cdn/${latestVersion}/data/en_US/championFull.json`, { next: { revalidate: 3600 } });
      if (!response.ok) {
        throw new Error(`Failed to fetch champion data: ${response.statusText}`);
      }
      
      const championData: ChampionFullData = await response.json();
      
      const champions: Champion[] = Object.values(championData.data).map(champ => ({
        id: champ.id,
        key: champ.key,
        name: champ.name,
        title: champ.title,
        skins: champ.skins.map(skin => {
            const tierData = skinTiers[skin.id];
            const tier = tierData ? getSkinTier(tierData.rarity, tierData.isLegacy) : null;
            return {
                ...skin,
                name: skin.name === 'default' ? champ.name : skin.name,
                tier: tier
            };
        })
      })).sort((a, b) => a.name.localeCompare(b.name));

      return champions;
    } catch (error) {
      console.error("Error fetching from Data Dragon:", error);
      throw new Error('Could not retrieve champion data from the official API.');
    }
  };


export const getChampionChromas = async (championKey: string): Promise<Chroma[]> => {
    try {
        const response = await fetch(`${CDRAGON_URL}/v1/champions/${championKey}.json`, { next: { revalidate: 3600 } });
        if (!response.ok) {
            // It's common for this unofficial API to be missing data for some champs, so don't throw, just return empty.
            console.warn(`Could not fetch chroma data for champion key ${championKey}: ${response.statusText}`);
            return [];
        }
        const champData: CommunityDragonChampion = await response.json();
        const allChromas: Chroma[] = [];

        champData.skins.forEach(skin => {
            if (skin.chromas && skin.chromas.length > 1) { // Often first "chroma" is the base skin
                skin.chromas.forEach(chroma => {
                    // Filter out the base skin which is often duplicated in chromas array
                    if (chroma.id.toString() !== skin.id.toString()) {
                        allChromas.push({
                            id: chroma.id.toString(),
                            name: chroma.name,
                            chromaPath: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${chroma.chromaPath.toLowerCase().replace('/lol-game-data/assets/', '')}`,
                            skinId: skin.id.toString()
                        });
                    }
                });
            }
        });

        return allChromas;
    } catch (error) {
        console.error("Error fetching from Community Dragon:", error);
        throw new Error('Could not retrieve champion chroma data.');
    }
};
