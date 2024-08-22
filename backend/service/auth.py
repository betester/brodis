from db import supabase
from dto.auth import UserLoginDto, UserSignUpDto, UserTokenDto
from fastapi import HTTPException

def sign_in(credentials : UserLoginDto):
    return supabase.auth.sign_in_with_password({
        "email" : credentials.email,
        "password" : credentials.password
})

def sign_up(credentials : UserSignUpDto):
    return supabase.auth.sign_up({
        "email" : credentials.email,
        "password" : credentials.password,
        "options" : {
            "data" : {
                "username" : credentials.username
            }
        }
    })

def refresh_access_token(refresh_token):
    return supabase.auth.refresh_session(refresh_token=refresh_token)

def get_current_user_with_jwt(access_token):
    return supabase.auth.get_user(access_token).user
    