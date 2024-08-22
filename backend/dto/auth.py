from pydantic import BaseModel

class UserLoginDto(BaseModel):
    email : str
    password : str

class UserSignUpDto(UserLoginDto):
    username : str

class UserTokenDto(BaseModel):
    refresh_token : str