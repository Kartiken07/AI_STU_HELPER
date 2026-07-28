from sqlalchemy import Column,String,Integer,Text,DateTime,ForeignKey,JSON
from sqlalchemy.sql import func
from Database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__='Users'
    id=Column(Integer,primary_key=True,index=True)
    email=Column(String,unique=True,index=True)
    password=Column(String,index=True)
    thread_id=Column(String,index=True,default=None)

class ChatThread(Base):
    __tablename__='ChatThreads'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('Users.id'), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__='ChatMessages'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('Users.id'), index=True)
    thread_id = Column(Integer, ForeignKey('ChatThreads.id'), index=True)
    role = Column(String, index=True)
    text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CareerNode(Base):
    __tablename__='CareerNodes'
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, index=True)
    parent_id = Column(String, ForeignKey('CareerNodes.id'), index=True, nullable=True)
    description = Column(Text, default='')
    salary = Column(String, default='')
    exams = Column(JSON, default=list)
    duration = Column(String, default='')
    skills = Column(JSON, default=list)
    sort_order = Column(Integer, default=0)
    children = relationship('CareerNode', backref='parent', remote_side=[id], order_by='CareerNode.sort_order')