import { unstable_cache } from 'next/cache';

const DDRAGON_URL = 'https://ddragon.leagueoflegends.com';
const CACHE_REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours

export type Skin = {
  id: string;
  name: string;
  num: number;
  chromas: boolean;
};

export type Champion = {
  id: string;
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

export function getSkinImageUrl(championId: string, skinNum: number) {
  return `${DDRAGON_URL}/img/champion/splash/${championId}_${skinNum}.jpg`;
}

export const getChampions = unstable_cache(
  async (): Promise<Champion[]> => {
    try {
      const versionsResponse = await fetch(`${DDRAGON_URL}/api/versions.json`);
      if (!versionsResponse.ok) {
        throw new Error(`Failed to fetch versions: ${versionsResponse.statusText}`);
      }
      const versions = await versionsResponse.json();
      const latestVersion = versions[0];

      const response = await fetch(`${DDRAGON_URL}/cdn/${latestVersion}/data/en_US/championFull.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch champion data: ${response.statusText}`);
      }
      
      const championData: ChampionFullData = await response.json();
      
      const champions: Champion[] = Object.values(championData.data).map(champ => ({
        id: champ.id,
        name: champ.name,
        title: champ.title,
        skins: champ.skins.map(skin => ({
          ...skin,
          name: skin.name === 'default' ? champ.name : skin.name
        }))
      })).sort((a, b) => a.name.localeCompare(b.name));

      return champions;
    } catch (error) {
      console.error("Error fetching from Data Dragon:", error);
      throw new Error('Could not retrieve champion data from the official API.');
    }
  },
  ['ddragon-champions-data'],
  { revalidate: CACHE_REVALIDATE_SECONDS }
);