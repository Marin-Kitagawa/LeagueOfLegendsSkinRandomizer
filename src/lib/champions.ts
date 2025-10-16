export type Skin = {
  name: string;
  imageId: string;
};

export type Champion = {
  id: string;
  name: string;
  skins: Skin[];
};

export const champions: Champion[] = [
  {
    id: 'lux',
    name: 'Lux',
    skins: [
      { name: 'Elementalist Lux', imageId: 'lux-elementalist' },
      { name: 'Cosmic Lux', imageId: 'lux-cosmic' },
      { name: 'Dark Cosmic Lux', imageId: 'lux-dark-cosmic' },
      { name: 'Porcelain Lux', imageId: 'lux-porcelain' },
      { name: 'Battle Academia Lux', imageId: 'lux-battle-academia' },
      { name: 'Pajama Guardian Lux', imageId: 'lux-pajama-guardian' },
      { name: 'Star Guardian Lux', imageId: 'lux-star-guardian' },
      { name: 'Steel Legion Lux', imageId: 'lux-steel-legion' },
    ],
  },
  {
    id: 'ahri',
    name: 'Ahri',
    skins: [
      { name: 'K/DA ALL OUT Ahri', imageId: 'ahri-kda-all-out' },
      { name: 'Spirit Blossom Ahri', imageId: 'ahri-spirit-blossom' },
      { name: 'Star Guardian Ahri', imageId: 'ahri-star-guardian' },
      { name: 'Arcade Ahri', imageId: 'ahri-arcade' },
      { name: 'Elderwood Ahri', imageId: 'ahri-elderwood' },
      { name: 'Coven Ahri', imageId: 'ahri-coven' },
    ],
  },
  {
    id: 'garen',
    name: 'Garen',
    skins: [
      { name: 'God-King Garen', imageId: 'garen-god-king' },
      { name: 'Demacia Vice Garen', imageId: 'garen-demacia-vice' },
      { name: 'Mecha Kingdoms Garen', imageId: 'garen-mecha-kingdoms' },
      { name: 'Warring Kingdoms Garen', imageId: 'garen-warring-kingdoms' },
      { name: 'Steel Legion Garen', imageId: 'garen-steel-legion' },
    ],
  },
    {
    id: 'yasuo',
    name: 'Yasuo',
    skins: [
      { name: 'Truth Dragon Yasuo', imageId: 'yasuo-truth-dragon' },
      { name: 'Dream Dragon Yasuo', imageId: 'yasuo-dream-dragon' },
      { name: 'Nightbringer Yasuo', imageId: 'yasuo-nightbringer' },
      { name: 'Odyssey Yasuo', imageId: 'yasuo-odyssey' },
      { name: 'High Noon Yasuo', imageId: 'yasuo-high-noon' },
      { name: 'PROJECT: Yasuo', imageId: 'yasuo-project' },
    ],
  },
];
