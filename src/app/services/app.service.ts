import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
    where,
    orderBy,
    type Unsubscribe,
} from 'firebase/firestore';
import { from, Observable, of, switchMap, tap, map, catchError, throwError } from 'rxjs';
import { auth, db } from '../core/firebase';

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    points: number;
    championId: string | null;
    totalBets?: number;
    wonGames?: number;
}

export interface Bet {
    userId: string;
    matchId: string;
    score1: number;
    score2: number;
    timestamp: number;
}

export interface GroupBet {
    userId: string;
    groupName: string;
    positions: unknown[];
    timestamp: number;
}

export interface MatchBetSummary {
    userName: string;
    score1: number;
    score2: number;
}

export interface Match {
    id: string;
    time: string;
    team1: string;
    team1Flag: string;
    team2: string;
    team2Flag: string;
    score1: number | null;
    score2: number | null;
    venue: string;
    isFinished: boolean;
    group: string;
    matchNumber?: number;
    /** ID del partido en football-data.org (lo asigna el script de sync) */
    footballDataId?: number;
    syncedAt?: string;
}

interface ResultsConfig {
    champion: string | null;
    groups: Record<string, string[] | null>;
}

@Injectable({
    providedIn: 'root',
})
export class AppService {
    private http = inject(HttpClient);

    currentUser = signal<User | null>(null);
    bets = signal<Bet[]>([]);
    groupBets = signal<GroupBet[]>([]);
    matches = signal<Match[]>([]);
    ranking = signal<User[]>([]);

    private matchesUnsubscribe: Unsubscribe | null = null;

    constructor() {
        onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                await this.loadProfileIntoState(fbUser.uid);
            } else {
                this.currentUser.set(null);
                this.bets.set([]);
                this.groupBets.set([]);
            }
            this.fetchMatches();
            this.fetchRanking();
        });
    }

    private profileToUser(id: string, data: Record<string, unknown>): User {
        return {
            id,
            name: String(data['name'] ?? ''),
            phone: String(data['phone'] ?? ''),
            email: data['email'] ? String(data['email']) : undefined,
            points: Number(data['points'] ?? 0),
            championId: (data['championId'] as string | null) ?? null,
        };
    }

    private async loadProfileIntoState(uid: string): Promise<void> {
        const snap = await getDoc(doc(db, 'profiles', uid));
        if (!snap.exists()) {
            this.currentUser.set(null);
            return;
        }
        const user = this.profileToUser(uid, snap.data());
        this.currentUser.set(user);
        this.fetchUserBets(uid);
        this.fetchGroupBets(uid);
    }

    private firebaseErrorMessage(code: string): string {
        const messages: Record<string, string> = {
            'auth/email-already-in-use': 'Este correo ya está registrado.',
            'auth/invalid-email': 'Correo electrónico inválido.',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
            'auth/user-not-found': 'Usuario no encontrado.',
            'auth/wrong-password': 'Contraseña incorrecta.',
            'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        };
        return messages[code] ?? 'Error de autenticación. Intenta de nuevo.';
    }

    register(
        email: string,
        password: string,
        name: string,
        phone: string,
    ): Observable<User> {
        return from(createUserWithEmailAndPassword(auth, email.trim(), password)).pipe(
            switchMap((cred) =>
                from(
                    setDoc(doc(db, 'profiles', cred.user.uid), {
                        name: name.trim(),
                        phone: phone.trim(),
                        email: email.trim().toLowerCase(),
                        points: 0,
                        championId: null,
                    }),
                ).pipe(map(() => cred.user.uid)),
            ),
            switchMap((uid) => from(this.loadProfileIntoState(uid)).pipe(map(() => this.currentUser()!))),
            catchError((err) =>
                throwError(() => new Error(this.firebaseErrorMessage(err?.code ?? ''))),
            ),
        );
    }

    login(email: string, password: string): Observable<User> {
        return from(signInWithEmailAndPassword(auth, email.trim(), password)).pipe(
            switchMap((cred) =>
                from(this.loadProfileIntoState(cred.user.uid)).pipe(map(() => this.currentUser()!)),
            ),
            catchError((err) =>
                throwError(() => new Error(this.firebaseErrorMessage(err?.code ?? ''))),
            ),
        );
    }

    fetchMatches() {
        if (this.matchesUnsubscribe) {
            this.matchesUnsubscribe();
            this.matchesUnsubscribe = null;
        }

        const matchesQuery = query(collection(db, 'matches'), orderBy('time'));
        this.matchesUnsubscribe = onSnapshot(
            matchesQuery,
            (snapshot) => {
                if (snapshot.empty) {
                    this.loadMatchesFromJsonFallback();
                    return;
                }
                const data = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Match, 'id'>),
                }));
                this.matches.set(data);
                this.fetchRanking();
            },
            (err) => {
                console.warn('Firestore matches:', err.message, '— usando matches.json');
                this.loadMatchesFromJsonFallback();
            },
        );
    }

    private loadMatchesFromJsonFallback() {
        this.http.get<Match[]>('/assets/matches.json').subscribe({
            next: (data) => {
                this.matches.set(data);
                this.fetchRanking();
            },
            error: (err) => console.error('No se pudieron cargar los partidos:', err),
        });
    }

    async fetchRanking() {
        try {
            const [profilesSnap, betsSnap, resultsSnap] = await Promise.all([
                getDocs(collection(db, 'profiles')),
                getDocs(collection(db, 'bets')),
                getDoc(doc(db, 'config', 'results')),
            ]);

            const matches = this.matches();
            const bets = betsSnap.docs.map((d) => d.data() as Bet);
            const groupBetsSnap = await getDocs(collection(db, 'group_bets'));
            const groupBets = groupBetsSnap.docs.map((d) => d.data() as GroupBet);
            const results: ResultsConfig = resultsSnap.exists()
                ? (resultsSnap.data() as ResultsConfig)
                : { champion: null, groups: {} };

            const publicRanking: User[] = profilesSnap.docs.map((profileDoc) => {
                const user = this.profileToUser(profileDoc.id, profileDoc.data());
                const userBets = bets.filter((b) => b.userId === user.id);
                const totalBets = userBets.length;
                let calculatedPoints = 0;
                let wonGames = 0;

                userBets.forEach((bet) => {
                    const match = matches.find((m) => m.id === bet.matchId);
                    if (
                        match &&
                        match.isFinished &&
                        match.score1 !== null &&
                        match.score2 !== null
                    ) {
                        const actualDiff = match.score1 - match.score2;
                        const predictedDiff = bet.score1 - bet.score2;

                        if (match.score1 === bet.score1 && match.score2 === bet.score2) {
                            calculatedPoints += 10;
                            wonGames++;
                        } else if (
                            (actualDiff > 0 && predictedDiff > 0) ||
                            (actualDiff < 0 && predictedDiff < 0) ||
                            (actualDiff === 0 && predictedDiff === 0)
                        ) {
                            calculatedPoints += 5;
                            wonGames++;
                        }
                    }
                });

                if (results.champion && user.championId === results.champion) {
                    calculatedPoints += 20;
                }

                const userGroupBets = groupBets.filter((gb) => gb.userId === user.id);
                userGroupBets.forEach((gb) => {
                    const officialOrder = results.groups[gb.groupName];
                    if (officialOrder && Array.isArray(officialOrder)) {
                        const positions = gb.positions as { name?: string }[];
                        if (positions[0]?.name === officialOrder[0]) {
                            calculatedPoints += 5;
                        }
                        const allMatch = positions.every(
                            (p, idx) => p.name === officialOrder[idx],
                        );
                        if (allMatch) {
                            calculatedPoints += 3;
                        }
                    }
                });

                return {
                    id: user.id,
                    name: user.name,
                    points: calculatedPoints + (user.points || 0),
                    totalBets,
                    wonGames,
                    phone: '',
                    championId: user.championId,
                };
            });

            publicRanking.sort(
                (a, b) => b.points - a.points || (b.wonGames ?? 0) - (a.wonGames ?? 0),
            );
            this.ranking.set(publicRanking);
        } catch (err) {
            console.error('Error cargando ranking:', err);
        }
    }

    fetchUserBets(userId: string) {
        const q = query(collection(db, 'bets'), where('userId', '==', userId));
        getDocs(q).then((snap) => {
            this.bets.set(snap.docs.map((d) => d.data() as Bet));
        });
    }

    fetchGroupBets(userId: string) {
        const q = query(collection(db, 'group_bets'), where('userId', '==', userId));
        getDocs(q).then((snap) => {
            this.groupBets.set(snap.docs.map((d) => d.data() as GroupBet));
        });
    }

    fetchMatchBets(matchId: string): Observable<MatchBetSummary[]> {
        const q = query(collection(db, 'bets'), where('matchId', '==', matchId));
        return from(getDocs(q)).pipe(
            switchMap((snap) => {
                const bets = snap.docs.map((d) => d.data() as Bet);
                if (bets.length === 0) {
                    return of([]);
                }
                return from(
                    Promise.all(
                        bets.map(async (b) => {
                            const profile = await getDoc(doc(db, 'profiles', b.userId));
                            return {
                                userName: profile.exists()
                                    ? String(profile.data()['name'])
                                    : 'Usuario',
                                score1: b.score1,
                                score2: b.score2,
                            };
                        }),
                    ),
                );
            }),
        );
    }

    private assertBettingAllowed(matchId: string): string | null {
        const match = this.matches().find((m) => m.id === matchId);
        if (!match) {
            return 'Partido no encontrado';
        }
        const startTime = new Date(match.time).getTime();
        const diffMinutes = (startTime - Date.now()) / (1000 * 60);
        if (diffMinutes < 10) {
            return 'Las apuestas se bloquean 10 minutos antes del partido';
        }
        return null;
    }

    placeBet(matchId: string, score1: number, score2: number) {
        const user = this.currentUser();
        if (!user) {
            return of(null);
        }

        const lockError = this.assertBettingAllowed(matchId);
        if (lockError) {
            console.error(lockError);
            return of(null);
        }
        if (score1 < 0 || score2 < 0) {
            return of(null);
        }

        const betId = `${user.id}_${matchId}`;
        const newBet: Bet = {
            userId: user.id,
            matchId,
            score1,
            score2,
            timestamp: Date.now(),
        };

        return from(setDoc(doc(db, 'bets', betId), newBet)).pipe(
            tap(() => {
                this.fetchUserBets(user.id);
                this.fetchRanking();
            }),
            catchError((err) => {
                console.error('Error al guardar apuesta:', err);
                return of(null);
            }),
        );
    }

    placeGroupBet(groupName: string, positions: unknown[]) {
        const user = this.currentUser();
        if (!user) {
            return of(null);
        }

        const matches = this.matches();
        const firstMatch = [...matches].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        )[0];

        if (firstMatch) {
            const deadline = new Date(firstMatch.time).getTime() - 10 * 60 * 1000;
            if (Date.now() > deadline) {
                console.error('Desafío de grupo cerrado');
                return of(null);
            }
        }

        if (this.groupBets().some((b) => b.groupName === groupName)) {
            console.error('Apuesta de grupo ya guardada');
            return of(null);
        }

        const betId = `${user.id}_${groupName}`;
        const newGroupBet: GroupBet = {
            userId: user.id,
            groupName,
            positions,
            timestamp: Date.now(),
        };

        return from(setDoc(doc(db, 'group_bets', betId), newGroupBet)).pipe(
            tap(() => {
                this.fetchGroupBets(user.id);
                this.fetchRanking();
            }),
            catchError((err) => {
                console.error('Group Bet Error:', err);
                return of(err);
            }),
        );
    }

    selectChampion(teamId: string) {
        const user = this.currentUser();
        if (!user) {
            return of(null);
        }

        return from(updateDoc(doc(db, 'profiles', user.id), { championId: teamId })).pipe(
            tap(() => {
                const updatedUser = { ...user, championId: teamId };
                this.currentUser.set(updatedUser);
                this.fetchRanking();
            }),
            catchError((err) => {
                console.error('Error selecting champion:', err);
                return of(null);
            }),
        );
    }

    getBetForMatch(matchId: string): Bet | undefined {
        return this.bets().find((b) => b.matchId === matchId);
    }

    logout() {
        signOut(auth);
        this.currentUser.set(null);
        this.bets.set([]);
        this.groupBets.set([]);
    }

    isLoggedIn(): boolean {
        return this.currentUser() !== null;
    }
}
