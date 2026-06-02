export const KNOCKOUT_GROUPS = [
    'Dieciseisavos',
    'Octavos',
    'Cuartos',
    'Semifinal',
    'Final',
] as const;

export const SCORE_EXACT_BASE = 5;
export const SCORE_RESULT_BASE = 5;
export const GROUP_FIRST_PLACE_POINTS = 1;
export const GROUP_FULL_ORDER_POINTS = 3;

/** Bonus extra por fase: +0 grupos, +1 16avos, +2 octavos, +3 cuartos, +4 semis, +5 final */
export function getRoundBonus(group: string): number {
    if (group.startsWith('Grupo ')) {
        return 0;
    }
    switch (group) {
        case 'Dieciseisavos':
            return 1;
        case 'Octavos':
            return 2;
        case 'Cuartos':
            return 3;
        case 'Semifinal':
            return 4;
        case 'Final':
            return 5;
        default:
            return 0;
    }
}

export function isKnockoutRound(group: string): boolean {
    return (KNOCKOUT_GROUPS as readonly string[]).includes(group);
}

export function getExactPoints(group: string): number {
    return SCORE_EXACT_BASE + getRoundBonus(group);
}

export function getResultPoints(group: string): number {
    return SCORE_RESULT_BASE + getRoundBonus(group);
}

export function getPenaltyPoints(group: string): number {
    const base = (() => {
        switch (group) {
            case 'Dieciseisavos':
            case 'Octavos':
                return 2;
            case 'Cuartos':
                return 3;
            case 'Semifinal':
                return 4;
            case 'Final':
                return 5;
            default:
                return 0;
        }
    })();
    return base + getRoundBonus(group);
}
