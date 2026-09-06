from fastapi import HTTPException, status


def session_not_found(session_id: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} was not found")
