from fastapi import APIRouter,Header
from service import auth as auth_service
from dto.auth import UserLoginDto, UserSignUpDto, UserTokenDto
from typing import Annotated

router = APIRouter(
    prefix='/auth',
    tags=['auth'],
    responses={404 : {
        "description" : "Not found"
    }}
)

@router.post("/sign_in")
def sign_in(login_dto : UserLoginDto):
    return auth_service.sign_in(login_dto)
  
@router.post("/sign_up")
def sign_up(sign_up_dto : UserSignUpDto):
    return auth_service.sign_up(sign_up_dto)

@router.get("/token")
def token(authorization : Annotated[str,Header()]):
    token = authorization.split(" ")[1]
    user = auth_service.get_current_user_with_jwt(token)
    return user

@router.post("/refresh_token")
def refresh_token(user_token_dto : UserTokenDto):
    return auth_service.refresh_access_token(user_token_dto.refresh_token)