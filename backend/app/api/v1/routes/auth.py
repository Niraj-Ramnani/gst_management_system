from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role,
    )
    await user.insert()
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email,
                          role=user.role, created_at=user.created_at),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email,
                          role=user.role, created_at=user.created_at),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=str(current_user.id), name=current_user.name,
                        email=current_user.email, role=current_user.role,
                        created_at=current_user.created_at)
