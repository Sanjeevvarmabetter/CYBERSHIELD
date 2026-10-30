from enum import Enum
from typing import List
from fastapi import HTTPException, status, Depends
from backend.app.core.security import decode_access_token

class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    ANALYST = "ANALYST"
    ADMIN = "ADMIN"

# Role hierarchy: ADMIN > ANALYST > CITIZEN
ROLE_HIERARCHY = {
    UserRole.ADMIN: [UserRole.ADMIN, UserRole.ANALYST, UserRole.CITIZEN],
    UserRole.ANALYST: [UserRole.ANALYST, UserRole.CITIZEN],
    UserRole.CITIZEN: [UserRole.CITIZEN]
}

def require_roles(allowed_roles: List[UserRole]):
    """FastAPI dependency to enforce that the authenticated user has one of the allowed roles."""
    def role_checker(token_payload: dict):
        if not token_payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication credentials were not provided or are invalid",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_role_str = token_payload.get("role")
        try:
            user_role = UserRole(user_role_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has an invalid or unrecognized role",
            )
        
        # Check hierarchy
        effective_roles = ROLE_HIERARCHY.get(user_role, [])
        if not any(role in effective_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {[r.value for r in allowed_roles]}",
            )
        return token_payload
    return role_checker
