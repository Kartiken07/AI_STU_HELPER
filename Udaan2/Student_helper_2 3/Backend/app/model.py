from dotenv import load_dotenv
load_dotenv()

import os
import sqlite3
from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver

conn = sqlite3.connect('User_chat.db', check_same_thread=False)
checkpoint = SqliteSaver(conn=conn)

class LLmState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

_llm = None
_model = None
_workflow = None
_chain = None
_chain1 = None


def _get_llm():
    global _llm
    if _llm is None:
        from langchain_huggingface import HuggingFaceEndpoint
        _llm = HuggingFaceEndpoint(
            repo_id="Qwen/Qwen3-4B-Instruct-2507",
            task="text-generation",
            temperature=0.7,
        )
    return _llm


def _get_model():
    global _model
    if _model is None:
        from langchain_huggingface import ChatHuggingFace
        _model = ChatHuggingFace(llm=_get_llm())
    return _model


def get_workflow():
    global _workflow
    if _workflow is None:
        from langchain_core.messages import AIMessage
        model = _get_model()

        def gen_llm(state: LLmState):
            response = model.invoke(state['messages']).content
            return {'messages': [AIMessage(content=response)]}

        graph = StateGraph(LLmState)
        graph.add_node('LLM', gen_llm)
        graph.add_edge(START, 'LLM')
        graph.add_edge('LLM', END)
        _workflow = graph.compile(checkpointer=checkpoint)
    return _workflow


def get_chain():
    global _chain
    if _chain is None:
        from langchain_core.output_parsers import StrOutputParser
        from langchain.prompts import PromptTemplate
        from langchain_huggingface import ChatHuggingFace
        llm1 = _get_llm()
        model2 = ChatHuggingFace(llm=llm1)
        prompt = PromptTemplate(
            template="Genenrate like we have suggest you {txt} stream after 10 and give some geetins to that kid.",
            input_variables=['txt']
        )
        parser = StrOutputParser()
        _chain = prompt | model2 | parser
    return _chain


def get_chain1():
    global _chain1
    if _chain1 is None:
        from langchain_core.output_parsers import StrOutputParser
        from langchain.prompts import PromptTemplate
        from langchain_huggingface import ChatHuggingFace
        llm1 = _get_llm()
        model2 = ChatHuggingFace(llm=llm1)
        prompt1 = PromptTemplate(
            template="Ans this ques {ques} based on the {context} and if not found then just give response I dont know okay.",
            input_variables=['ques', 'context']
        )
        parser = StrOutputParser()
        _chain1 = prompt1 | model2 | parser
    return _chain1
