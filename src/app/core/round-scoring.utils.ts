export const KNOCKOUT_GROUPS = [
    'Dieciseisavos',
    'Octavos',
    'Cuartos',
    'Semifinal',
    'Final',
] as const;

export const SCORE_EXACT_BASE = 10;
export const SCORE_RESULT_BASE = 5;
export const GROUP_FIRST_PLACE_POINTS = 1;
/** Acertar las 4 posiciones del grupo: 3 pts (NO se suma al punto del 1º puesto) */
export const GROUP_FULL_ORDER_POINTS = 3;
/** Acertar el ganador de los penaltis: 1 pto en todas las rondas */
export const PENALTY_POINTS = 1;

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

/** Resultado exacto: 10 en grupos; 11/12/13/14/15 en 16avos/8vos/4tos/semi/final */
export function getExactPoints(group: string): number {
    return SCORE_EXACT_BASE + getRoundBonus(group);
}

/** Ganador o empate: 5 en grupos; 6/7/8/9/10 en 16avos/8vos/4tos/semi/final */
export function getResultPoints(group: string): number {
    return SCORE_RESULT_BASE + getRoundBonus(group);
}

/** Penaltis (solo eliminatorias): 1 pto en todas las rondas hasta la final */
export function getPenaltyPoints(group: string): number {
    return isKnockoutRound(group) ? PENALTY_POINTS : 0;
}
