from pydantic import BaseModel



class ProfileResponse(BaseModel):
    id : int
    username : str
    email : str
    lang : str = 'En'
    created_at : str
    updated_at : str | None

class ProfileCreate(BaseModel):
    username : str
    email : str
    lang : str = 'En'

class ProfileUpdate(BaseModel):
    username : str
    email : str
    lang : str = 'En'