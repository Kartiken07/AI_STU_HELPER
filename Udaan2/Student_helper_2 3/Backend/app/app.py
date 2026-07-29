from fastapi import FastAPI,UploadFile,File,Form,HTTPException,Depends
from fastapi.middleware.cors import CORSMiddleware
from Chatschema import Userinput,ChatRequest,Scores,Login,UserCreate,CareerNodeCreate,CareerNodeUpdate
from rag import store_document, query_documents, list_documents, delete_document
from datetime import datetime
import models_database
import time
import bcrypt
import os
from sqlalchemy.orm import Session
from Database import Base,engine,sessionlocal
from auth import create_access_token, get_current_user
from typing import List
from pydantic import BaseModel
Base.metadata.create_all(bind=engine)

def get_db():
    db=sessionlocal()
    try:
        yield db
    finally:
        db.close()

app=FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/chat')
def chat(user:ChatRequest, db:Session=Depends(get_db), current_user: models_database.User = Depends(get_current_user)):
    from model import get_workflow
    text={
        'messages':f"Your personal guide for career development and educational planning answer based on that the query this use less emojies okay{user.text}"
    }
    thread_id = str(current_user.id)
    CONFIG = {
        "configurable": {"thread_id": thread_id},
        "metadata": {"thread_id": thread_id},
        "run_name": "chat_turn",
    }
    response=get_workflow().invoke(text,config=CONFIG)
    messages = response["messages"] if isinstance(response, dict) else response.messages

    bot_reply = messages[-1].content if messages else "Sorry, I didn't catch that."

    try:
        thread = db.query(models_database.ChatThread).filter(models_database.ChatThread.user_id==current_user.id).order_by(models_database.ChatThread.id.desc()).first()
        if thread is None:
            thread = models_database.ChatThread(user_id=current_user.id)
            db.add(thread)
            db.commit()
            db.refresh(thread)
        db.add(models_database.ChatMessage(user_id=current_user.id, thread_id=thread.id, role='user', text=user.text))
        db.add(models_database.ChatMessage(user_id=current_user.id, thread_id=thread.id, role='assistant', text=bot_reply))
        db.commit()
    except Exception as e:
        print('Chat persistence error:', e)

    return {
        "id": int(time.time()),
        "text": bot_reply,
        "isUser": False,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get('/chat/history')
def chat_history(limit:int=50, db:Session=Depends(get_db), current_user: models_database.User = Depends(get_current_user)):
    thread = db.query(models_database.ChatThread).filter(models_database.ChatThread.user_id==current_user.id).order_by(models_database.ChatThread.id.desc()).first()
    if thread is None:
        return {"messages": []}
    rows = (
        db.query(models_database.ChatMessage)
        .filter(models_database.ChatMessage.thread_id==thread.id)
        .order_by(models_database.ChatMessage.id.desc())
        .limit(limit)
        .all()
    )
    rows = list(reversed(rows))
    return {"messages": [
        {
            "id": r.id,
            "text": r.text,
            "isUser": True if r.role=='user' else False,
            "timestamp": r.created_at.isoformat() if r.created_at else datetime.utcnow().isoformat()
        } for r in rows
    ]}

@app.post('/submit-quiz')
def stream_pre(score:Scores, current_user: models_database.User = Depends(get_current_user)):
    from loadmodel import model
    from model import get_chain
    features=[[
        score.aptitude_score,
        score.science_score,
        score.commerce_score,
        score.arts_score,
        score.interest_arts,
        score.interest_commerce,
        score.interest_arts
    ]]
    pre=model.predict(features)[0]
    num=int(pre)
    stream=''
    if num == 0:
        stream='Science-PCM'
    elif num ==1:
        stream="Science-PCB"
    elif num==2:
        stream="Commerce"
    elif num==3:
        stream="Arts"
    else:
        stream="Vocational"
    result=get_chain().invoke({'txt':stream})
    return {"predicted_stream":result}

@app.post('/login')
def login(user:Login,db:Session=Depends(get_db)):
    x=db.query(models_database.User).filter(models_database.User.email==user.email).first()
    if x is None:
        raise HTTPException(status_code=404,detail="User Does Not Exist")
    # Try bcrypt first, fall back to plaintext for legacy users
    try:
        pw_valid = bcrypt.checkpw(user.password.encode(), x.password.encode())
    except Exception:
        pw_valid = False
    if not pw_valid:
        # Legacy plaintext fallback — upgrade to bcrypt on success
        if x.password.strip() != user.password.strip():
            raise HTTPException(status_code=404,detail="Wrong Password!")
        hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
        x.password = hashed
        db.commit()
    token = create_access_token({"user_id": x.id, "email": x.email})
    return {"ok":True, "user_id": x.id, "email": x.email, "access_token": token, "token_type": "bearer"}

@app.post('/signup')
def create_user(user:UserCreate,db:Session=Depends(get_db)):
    db_mo=db.query(models_database.User).filter(models_database.User.email==user.email).first()
    if db_mo:
        raise HTTPException(status_code=409,detail="User Already Exist")
    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    db_user=models_database.User(
        email=user.email,
        password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    try:
        thread = models_database.ChatThread(user_id=db_user.id)
        db.add(thread)
        db.commit()
    except Exception as e:
        print('Thread create error:', e)
    token = create_access_token({"user_id": db_user.id, "email": db_user.email})
    return {"ok":True, "user_id": db_user.id, "email": db_user.email, "access_token": token, "token_type": "bearer"}

@app.post('/check_college')
async def check_college(text: str = Form(""), file: UploadFile = File(None)):
    if file:
        content = await file.read()
        text += f"\n[File: {file.filename} ({len(content)} bytes)]"
    return {"text": f"Received: {text[:200]}" + ("..." if len(text) > 200 else "")}

@app.get('/me')
def get_me(current_user: models_database.User = Depends(get_current_user)):
    return {"user_id": current_user.id, "email": current_user.email}

def node_to_dict(node: models_database.CareerNode) -> dict:
    return {
        "id": node.id,
        "name": node.name,
        "type": node.type,
        "parent_id": node.parent_id,
        "description": node.description or "",
        "salary": node.salary or "",
        "exams": node.exams or [],
        "duration": node.duration or "",
        "skills": node.skills or [],
        "sort_order": node.sort_order,
    }

@app.get('/career-tree')
def get_career_tree(db: Session = Depends(get_db)):
    nodes = db.query(models_database.CareerNode).order_by(models_database.CareerNode.sort_order).all()
    node_map = {n.id: node_to_dict(n) for n in nodes}
    tree: list[dict] = []
    for n in nodes:
        d = node_map[n.id]
        d["children"] = []
        if n.parent_id and n.parent_id in node_map:
            parent = node_map[n.parent_id]
            parent.setdefault("children", []).append(d)
        else:
            tree.append(d)
    return tree

@app.post('/admin/career-nodes')
def create_career_node(node: CareerNodeCreate, db: Session = Depends(get_db), current_user: models_database.User = Depends(get_current_user)):
    existing = db.query(models_database.CareerNode).filter(models_database.CareerNode.id == node.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Node with this ID already exists")
    db_node = models_database.CareerNode(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return node_to_dict(db_node)

@app.put('/admin/career-nodes/{node_id}')
def update_career_node(node_id: str, update: CareerNodeUpdate, db: Session = Depends(get_db), current_user: models_database.User = Depends(get_current_user)):
    node = db.query(models_database.CareerNode).filter(models_database.CareerNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(node, field, value)
    db.commit()
    db.refresh(node)
    return node_to_dict(node)

@app.delete('/admin/career-nodes/{node_id}')
def delete_career_node(node_id: str, db: Session = Depends(get_db), current_user: models_database.User = Depends(get_current_user)):
    node = db.query(models_database.CareerNode).filter(models_database.CareerNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    children = db.query(models_database.CareerNode).filter(models_database.CareerNode.parent_id == node_id).all()
    for child in children:
        child.parent_id = None
    db.delete(node)
    db.commit()
    return {"ok": True}


class RAGChatRequest(BaseModel):
    text: str
    doc_id: str | None = None


@app.post('/rag/upload')
async def rag_upload(
    file: UploadFile = File(...),
    current_user: models_database.User = Depends(get_current_user),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        result = store_document(file.filename, content, file.content_type or "application/pdf")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@app.post('/rag/chat')
def rag_chat(
    req: RAGChatRequest,
    current_user: models_database.User = Depends(get_current_user),
):
    from model import get_chain1
    docs = query_documents(req.text)
    if not docs:
        return {
            "text": "No relevant documents found. Please upload a document first.",
            "sources": [],
        }

    context = "\n\n".join([d["text"] for d in docs])
    source_names = list(set([d["doc_name"] for d in docs]))

    prompt_text = (
        f"Answer the following question based on the provided context.\n"
        f"If the answer is not in the context, say 'I don't have enough information to answer that.'\n"
        f"Do not use emojis.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {req.text}\n\n"
        f"Answer:"
    )

    result = get_chain1().invoke({"ques": prompt_text, "context": ""})

    return {
        "text": result,
        "sources": source_names,
        "chunks_used": len(docs),
    }


@app.get('/rag/documents')
def rag_documents(current_user: models_database.User = Depends(get_current_user)):
    return {"documents": list_documents()}


@app.delete('/rag/documents/{doc_id}')
def rag_delete_document(doc_id: str, current_user: models_database.User = Depends(get_current_user)):
    deleted = delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"ok": True, "doc_id": doc_id}
