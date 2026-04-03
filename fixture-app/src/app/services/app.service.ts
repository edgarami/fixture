import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of, Observable } from 'rxjs';

export interface User {
    id: string;
    name: string;
    phone: string;
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
    positions: any[];
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
}

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private http = inject(HttpClient);
    // Cambiamos nuevamente a la IP local porque el túnel público bloquea los datos con páginas de advertencia
    private apiUrl = 'http://192.168.0.18:3000/api';

    // Reactive state using Signals
    currentUser = signal<User | null>(this.loadLocalUser());
    bets = signal<Bet[]>([]);
    groupBets = signal<GroupBet[]>([]);
    matches = signal<Match[]>([]);
    ranking = signal<User[]>([]);

    constructor() {
        if (this.currentUser()) {
            this.fetchUserBets(this.currentUser()!.id);
            this.fetchGroupBets(this.currentUser()!.id);
        }
        this.fetchMatches();
        this.fetchRanking();
    }

    private loadLocalUser(): User | null {
        const data = localStorage.getItem('fixture_user');
        return data ? JSON.parse(data) : null;
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'X-User-ID': this.currentUser()?.id || ''
        });
    }

    register(name: string, phone: string): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/auth/register`, { name, phone }).pipe(
            tap(user => {
                this.currentUser.set(user);
                localStorage.setItem('fixture_user', JSON.stringify(user));
                this.fetchUserBets(user.id);
            })
        );
    }

    fetchMatches() {
        this.http.get<Match[]>(`${this.apiUrl}/matches`).subscribe(data => {
            this.matches.set(data);
        });
    }

    fetchRanking() {
        this.http.get<User[]>(`${this.apiUrl}/ranking`).subscribe(data => {
            this.ranking.set(data);
        });
    }

    fetchUserBets(userId: string) {
        this.http.get<Bet[]>(`${this.apiUrl}/bets/${userId}`, { headers: this.getHeaders() }).subscribe(data => {
            this.bets.set(data);
        });
    }

    fetchGroupBets(userId: string) {
        this.http.get<GroupBet[]>(`${this.apiUrl}/bets/groups/${userId}`, { headers: this.getHeaders() }).subscribe(data => {
            this.groupBets.set(data);
        });
    }

    fetchMatchBets(matchId: string): Observable<MatchBetSummary[]> {
        return this.http.get<MatchBetSummary[]>(`${this.apiUrl}/matches/${matchId}/bets`);
    }

    placeBet(matchId: string, score1: number, score2: number) {
        const user = this.currentUser();
        if (!user) return of(null);

        return this.http.post(`${this.apiUrl}/bets`, {
            matchId,
            score1,
            score2
        }, { headers: this.getHeaders() }).pipe(
            tap(() => {
                this.fetchUserBets(user.id);
            }),
            catchError(err => {
                console.error('Security/Lock Error:', err);
                return of(null);
            })
        );
    }

    placeGroupBet(groupName: string, positions: any[]) {
        const user = this.currentUser();
        if (!user) return of(null);

        return this.http.post(`${this.apiUrl}/bets/groups`, {
            groupName,
            positions
        }, { headers: this.getHeaders() }).pipe(
            tap(() => {
                this.fetchGroupBets(user.id);
            }),
            catchError(err => {
                console.error('Group Bet Error:', err);
                return of(err);
            })
        );
    }

    selectChampion(teamId: string) {
        const user = this.currentUser();
        if (!user) return of(null);

        return this.http.post(`${this.apiUrl}/user/champion`, {
            championId: teamId
        }, { headers: this.getHeaders() }).pipe(
            tap(() => {
                const updatedUser = { ...user, championId: teamId };
                this.currentUser.set(updatedUser);
                localStorage.setItem('fixture_user', JSON.stringify(updatedUser));
            }),
            catchError(err => {
                console.error('Error selecting champion:', err);
                return of(null);
            })
        );
    }

    getBetForMatch(matchId: string): Bet | undefined {
        return this.bets().find(b => b.matchId === matchId);
    }

    logout() {
        this.currentUser.set(null);
        this.bets.set([]);
        localStorage.removeItem('fixture_user');
    }

    isLoggedIn(): boolean {
        return this.currentUser() !== null;
    }
}
