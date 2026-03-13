from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.schemas.business import BusinessProfileCreate, BusinessProfileResponse
from app.models.business import BusinessProfile
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/profile", response_model=BusinessProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = await BusinessProfile.find_one(BusinessProfile.user_id == str(current_user.id))
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found")
    return BusinessProfileResponse(id=str(profile.id), **profile.dict(exclude={"id", "revision_id"}))


@router.post("/profile", response_model=BusinessProfileResponse, status_code=201)
async def create_profile(data: BusinessProfileCreate, current_user: User = Depends(get_current_user)):
    existing = await BusinessProfile.find_one(BusinessProfile.user_id == str(current_user.id))
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")
    profile = BusinessProfile(user_id=str(current_user.id), **data.dict())
    await profile.insert()
    return BusinessProfileResponse(id=str(profile.id), **profile.dict(exclude={"id", "revision_id"}))


@router.put("/profile", response_model=BusinessProfileResponse)
async def update_profile(data: BusinessProfileCreate, current_user: User = Depends(get_current_user)):
    profile = await BusinessProfile.find_one(BusinessProfile.user_id == str(current_user.id))
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found")
    update_data = data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    await profile.update({"$set": update_data})
    await profile.sync()
    return BusinessProfileResponse(id=str(profile.id), **profile.dict(exclude={"id", "revision_id"}))
