from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from src.models.user import UserCreate, Token, UserResponse
from src.controllers.auth import AuthController
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token, status_code=201)
async def signup(user: UserCreate):
    return await AuthController.signup(user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm expects username and password, we use email as username
    return await AuthController.login(email=form_data.username, password=form_data.password)

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    # With stateless JWT, logout is usually handled client-side by deleting token.
    # To implement server-side logout, we'd need a token blacklist in Redis/MongoDB.
    return {"success": True, "message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    return UserResponse(**current_user)
