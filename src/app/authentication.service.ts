import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'
import { ConstantsService } from './common/services/constants.service'

export interface UserDetails {
    id: number
    first_name: string
    last_name: string
    email: string
    password: string
    exp: number
    iat: number
}

interface TokenResponse {
    token: string
}

export interface TokenPayload {
    username: string
    password: string
    email: string
    name: string
}

@Injectable()
export class AuthenticationService {
    private token: string

    constructor(private http: HttpClient, private router: Router,private constant: ConstantsService) { }

    private saveToken (token: string): void {
        localStorage.setItem('usertoken', token)
        this.token = token
    }

    private getToken (): string {
        if (!this.token) {
            this.token = localStorage.getItem('usertoken')
        }
        return this.token
    }

    public getUserDetails (): UserDetails {
        const token = this.getToken()
        let payload
        if (token) {
            payload = token.split('.')[1]
            payload = window.atob(payload)
            return JSON.parse(payload)
        } else {
            return null
        }
    }

    public isLoggedIn (): boolean {
        const user = this.getUserDetails()
        if (user) {
            return (user.exp+3000) > Date.now() / 1000
        } else {
            return false
        }
    }

    public register (user: TokenPayload): Observable<any> {
        return this.http.post(this.constant.URL+"/agent", user)
    }

    public login (user: TokenPayload): Observable<any> {
        const base = this.http.post(this.constant.URL+"/login",user)

        const request = base.pipe(
            map((data: TokenResponse) => {
                if (data.token) {
                    this.saveToken(data.token)
                    console.log("token saved")
                }
                return data
            })
        )

        return request
    }

    public logout (): void {
        this.token = ''
        window.localStorage.removeItem('usertoken')
        this.router.navigateByUrl('/')
    }
}