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

type ChampionListResponse = {
  type: string;
  format: string;
  version: string;
  data: {
    [key: string]: {
      id: string;
      name: string;
      title: string;
    };
  };
};

export function getSkinImageUrl(championId: string, skinNum: number) {
  if (skinNum === 0) {
    return `${DDRAGON_URL}/img/champion/splash/${championId}_0.jpg`;
  }
  return `${DDRAGON_URL}/img/champion/splash/${championId}_${skinNum}.jpg`;
}

export const getChampions = unstable_cache(
  async (): Promise<Champion[]> => {
    try {
      const versionsResponse = await fetch(`${DDRAGON_URL}/api/versions.json`);
      if (!versionsResponse.ok) throw new Error('Failed to fetch versions');
      const versions = await versionsResponse.json();
      const latestVersion = versions[0];

      const championListResponse = await fetch(
        `${DDRAGON_URL}/cdn/${latestVersion}/data/en_US/champion.json`
      );
      if (!championListResponse.ok) throw new Error('Failed to fetch champions list');
      const championListData: ChampionListResponse = await championListResponse.json();

      const championDetailsPromises = Object.values(championListData.data).map(
        async (championInfo) => {
          const championDetailResponse = await fetch(
            `${DDRAGON_URL}/cdn/${latestVersion}/data/en_US/champion/${championInfo.id}.json`
          );
          if (!championDetailResponse.ok) {
            console.error(`Failed to fetch details for ${championInfo.id}`);
            return null;
          }
          const champDetailData = await championDetailResponse.json();
          return champDetailData.data[championInfo.id] as ChampionData;
        }
      );

      const championsDetails = (await Promise.all(championDetailsPromises)).filter(
        (c) => c !== null
      ) as ChampionData[];

      const champions: Champion[] = championsDetails
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
      return [];
    }
  },
  ['champions'],
  { revalidate: CACHE_REVALIDATE_SECONDS }
);
