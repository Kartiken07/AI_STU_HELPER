from pydantic import BaseModel,EmailStr
# {
#       id: 1,
#       text: "Hello! I'm your Student Career Helper. I can assist you with career guidance, job search tips, resume advice, college information, interview preparation, and much more. How can I help you today?",
#       isUser: false,
#       timestamp: new Date()
#     }

class Userinput(BaseModel):
    text:str
class ChatRequest(BaseModel):
    text: str
    user_id: int | None = None
    history: list | None = None
class Scores(BaseModel):
    aptitude_score: int
    science_score: int
    arts_score: int
    commerce_score: int
    interest_science: int
    interest_arts: int
    interest_commerce: int

class Login(BaseModel):
    email:EmailStr
    password:str
class UserCreate(BaseModel):
    email:EmailStr
    password:str

class CareerNodeCreate(BaseModel):
    id: str
    name: str
    type: str
    parent_id: str | None = None
    description: str = ''
    salary: str = ''
    exams: list[str] = []
    duration: str = ''
    skills: list[str] = []
    sort_order: int = 0

class CareerNodeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    salary: str | None = None
    exams: list[str] | None = None
    duration: str | None = None
    skills: list[str] | None = None
    sort_order: int | None = None