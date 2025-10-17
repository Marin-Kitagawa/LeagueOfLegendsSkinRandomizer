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

export type ChampionData = {
    id: string;
    name: string;
    title: string;
    skins: {
        id: string;
        num: number;
        name: string;
        chromas: boolean;
    }[];
};

type ChampionFullData = {
    [key: string]: ChampionData;
}

type ChampionFullResponse = {
    type: string;
    format: string;
    version: string;
    data: ChampionFullData;
}


export function getSkinImageUrl(championId: string, skinNum: number) {
  return `${DDRAGON_URL}/img/champion/splash/${championId}_${skinNum}.jpg`;
}

export const getChampions = unstable_cache(
  async (): Promise<Champion[]> => {
    try {
      const versionsResponse = await fetch(`${DDRAGON_URL}/api/versions.json`);
      if (!versionsResponse.ok) throw new Error('Failed to fetch versions');
      const versions = await versionsResponse.json();
      const latestVersion = versions[0];

      const championFullResponse = await fetch(
        `${DDRAGON_URL}/cdn/${latestVersion}/data/en_US/championFull.json`
      );
      if (!championFullResponse.ok) throw new Error('Failed to fetch champion data');
      const championFullData: ChampionFullResponse = await championFullResponse.json();
      
      const champions: Champion[] = Object.values(championFullData.data)
        .map((champ) => ({
          id: champ.id,
          name: champ.name,
          title: champ.title,
          skins: champ.skins.map((skin) => ({
            ...skin,
            name: skin.name === 'default' ? champ.name : skin.name,
          })),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return champions;
    } catch (error) {
      console.error('Error fetching champion data:', error);
      throw new Error('Failed to fetch champion data from Data Dragon API.');
    }
  },
  ['champions-data-full'],
  { revalidate: CACHE_REVALIDATE_SECONDS }
);