from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from src.models.user import UserCreate, Token, UserResponse
from src.services.auth import AuthService

class AuthController:
    @staticmethod
    async def signup(user_data: UserCreate):
        try:
            user = await AuthService.create_user(user_data)
            # Unpack the tuple: (access_token, user_dict)
            access_token, auth_user = await AuthService.authenticate_user(user_data.email, user_data.password)
            
            user_response = UserResponse(**user)
            
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
            
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"Signup error: {str(e)}") # Log for debugging
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    @staticmethod
    async def login(email: str, password: str):
        try:
            access_token, user = await AuthService.authenticate_user(email, password)
            user["_id"] = str(user["_id"])
            user_response = UserResponse(**user)
            
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
