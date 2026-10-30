from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.database.models.models import User
from backend.app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserProfile
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.core.permissions import UserRole
from backend.app.core.audit import record_audit_log
from backend.app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user account (defaults to CITIZEN role)."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    role = user_in.role.upper() if user_in.role else "CITIZEN"
    if role not in [r.value for r in UserRole]:
        role = "CITIZEN"
    
    new_user = User(
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(subject=new_user.id, role=new_user.role)
    
    record_audit_log(
        db=db,
        action="USER_REGISTRATION",
        target_entity="User",
        user_id=new_user.id,
        target_id=new_user.id,
        ip_address=request.client.host if request.client else None,
        details={"email": new_user.email, "role": new_user.role}
    )
    
    return TokenResponse(
        access_token=token,
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        full_name=new_user.full_name
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate with email and Argon2id password, returning JWT access token."""
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated"
        )
        
    token = create_access_token(subject=user.id, role=user.role)
    
    record_audit_log(
        db=db,
        action="USER_LOGIN_SUCCESS",
        target_entity="User",
        user_id=user.id,
        target_id=user.id,
        ip_address=request.client.host if request.client else None,
        details={"email": user.email, "role": user.role}
    )
    
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user's profile."""
    return current_user
