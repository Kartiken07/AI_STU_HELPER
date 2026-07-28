from langgraph.graph import StateGraph,START,END
from typing import TypedDict
from langchain_huggingface import ChatHuggingFace,HuggingFaceEndpoint
from dotenv import load_dotenv
import sqlite3
from typing import Annotated,List
from langchain_core.messages import BaseMessage,HumanMessage,AIMessage
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate
load_dotenv()
conn=sqlite3.connect('User_chat.db',check_same_thread=False)
checkpoint=SqliteSaver(conn=conn)
class LLmState(TypedDict):
    messages:Annotated[List[BaseMessage],add_messages]
llm=HuggingFaceEndpoint(
    repo_id="Qwen/Qwen3-4B-Instruct-2507",
    task="text-generation",
    temperature=0.7,
)

llm1=HuggingFaceEndpoint(
    repo_id="Qwen/Qwen3-4B-Instruct-2507",
    task="text-generation",
    temperature=0.7,
)
model2=ChatHuggingFace(llm=llm1)
prompt=PromptTemplate(
    template="Genenrate like we have suggest you {txt} stream after 10 and give some geetins to that kid.",
    input_variables=['txt']
)
prompt1=PromptTemplate(
    template="Ans this ques {ques} based on the {context} and if not found then just give response I dont know okay.",
    input_variables=['ques','context']
)
model=ChatHuggingFace(llm=llm)
graph=StateGraph(LLmState)
parser=StrOutputParser()
chain=prompt|model2|parser
chain1=prompt1|model2|parser


def gen_llm(state:LLmState):
    response=model.invoke(state['messages']).content
    return {'messages':[AIMessage(content=response)]}

graph.add_node('LLM',gen_llm)
graph.add_edge(START,'LLM')
graph.add_edge('LLM',END)
workflow=graph.compile(checkpointer=checkpoint)
# def all_thread():
#     threads=set()
#     for x in checkpoint.list(None):
#         threads.add(x.config["configurable"]["thread_id"])
#     return list(threads)








