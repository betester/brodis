from db import SessionLocal,engine
from service import auth as auth_service
from fastapi import Request,Header
from typing import Annotated


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
def verify_user_is_logged_in(request : Request, authorization : Annotated[str,Header()]):
    token = authorization.split(" ")[1]
    user = auth_service.get_current_user_with_jwt(token)
    request.state.user = user