
export type SkinTier = {
    name: string;
    iconUrl: string | null;
};

const skinTiers: Record<string, Omit<SkinTier, 'iconUrl'> & { icon: string }> = {
    'kEpic': { name: 'Epic', icon: 'epic' },
    'kLegendary': { name: 'Legendary', icon: 'legendary' },
    'kMythic': { name: 'Mythic', icon: 'mythic' },
    'kUltimate': { name: 'Ultimate', icon: 'ultimate' },
    'kTranscendent': { name: 'Transcendent', icon: 'transcendent' },
    'kExalted': { name: 'Exalted', icon: 'exalted' },
};

const LEGACY_TIER: Omit<SkinTier, 'iconUrl'> & { icon: string } = { name: 'Legacy', icon: 'legacy' };
const CDRAGON_API_VERSION = 'v1';
const CDRAGON_ICON_BASE_URL = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${CDRAGON_API_VERSION}/rarity-gem-icons`;

export function getSkinTier(rarity: string, isLegacy: boolean): SkinTier | null {
    if (isLegacy) {
        return {
            name: LEGACY_TIER.name,
            iconUrl: null
        };
    }

    const tier = skinTiers[rarity];
    if (tier) {
        return {
            name: tier.name,
            iconUrl: `${CDRAGON_ICON_BASE_URL}/${tier.icon}.png`
        };
    }
    
    return null;
}
