import { ISignIn, ISignUp, IUser } from "@/models"
import { axiosInstance } from "."

const SIGNIN_URL = "/auth/sign_in"
const SIGNUP_URL = "auth/sign_up"
const REFRESH_TOKEN_URL = "auth/refresh_token"
const TOKEN_URL = "auth/token"

export const signIn = async ({ email, password }: ISignIn) => {
    try {
        const response = await axiosInstance.post(SIGNIN_URL, {
            email: email,
            password: password
        })
        return response.data['session']
    }
    catch (error) {
        return undefined
    }
}

export const signUp = async ({ email, username, password }: ISignUp) => {
    try {
        const response = await axiosInstance.post(SIGNUP_URL, {
            email: email,
            password: password,
            username: username
        })
        return response.data
    }
    catch (error) {
        return undefined
    }
}

export const saveToken = (
    accessToken: string,
    refreshToken: string,
    expiresAt: number) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('expiresAt', String(expiresAt))
}

const refreshToken = async () => {
    try {
        const response = await axiosInstance.post(REFRESH_TOKEN_URL, {
            'refresh_token': localStorage.getItem('refreshToken')
        })

        const newSession = response.data['session']
        saveToken(
            newSession['access_token'],
            newSession['refresh_token'],
            newSession['expires_at']
        )
        return true
    }

    catch (err) {
        return false
    }

}

export const logOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    
}

export const authenticate = async (): Promise<false | IUser> => {
    const expiresAt = localStorage.getItem('expiresAt')

    if (!expiresAt) {
        return false;
    }

    else if (new Date(parseInt(expiresAt, 10) * 1000) < new Date()) {
        const refreshed = await refreshToken()
        if (!refreshed) {
            return false
        }
    }

    try {
        const response = await axiosInstance.get(TOKEN_URL, {
            'headers': {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })


        const data: IUser = {
            'email': response.data['email'],
            'username': response.data['user_metadata']['username']
        }
        return data
    }

    catch (err) {
        console.log(err)
        return false;
    }

}