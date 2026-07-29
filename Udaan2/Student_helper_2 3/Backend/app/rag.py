import os
import uuid
import io

CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
TOP_K = 5

_collection = None
_embeddings = None
_splitter = None


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    return _embeddings


def _get_collection():
    global _collection
    if _collection is None:
        import chromadb
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _collection = client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
    return _collection


def _get_splitter():
    global _splitter
    if _splitter is None:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        _splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    return _splitter


def extract_text_from_pdf(file_content: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(file_content))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()


def extract_text_from_txt(file_content: bytes) -> str:
    try:
        return file_content.decode("utf-8").strip()
    except UnicodeDecodeError:
        return file_content.decode("latin-1").strip()


def store_document(file_name: str, file_content: bytes, file_type: str) -> dict:
    collection = _get_collection()
    splitter = _get_splitter()

    if file_type == "application/pdf":
        text = extract_text_from_pdf(file_content)
    elif file_type in ("text/plain", "text/txt"):
        text = extract_text_from_txt(file_content)
    else:
        raise ValueError(f"Unsupported file type: {file_type}. Upload PDF or TXT files.")

    if not text:
        raise ValueError("Could not extract any text from the file.")

    chunks = splitter.split_text(text)
    if not chunks:
        raise ValueError("File produced no text chunks.")

    doc_id = str(uuid.uuid4())
    chunk_ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    chunk_metadatas = [
        {"doc_id": doc_id, "doc_name": file_name, "chunk_index": i, "total_chunks": len(chunks)}
        for i in range(len(chunks))
    ]

    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i+batch_size]
        batch_ids = chunk_ids[i:i+batch_size]
        batch_meta = chunk_metadatas[i:i+batch_size]
        collection.add(
            documents=batch_chunks,
            ids=batch_ids,
            metadatas=batch_meta,
        )

    return {
        "doc_id": doc_id,
        "doc_name": file_name,
        "chunks": len(chunks),
        "total_chars": len(text),
    }


def query_documents(question: str, top_k: int = TOP_K) -> list[dict]:
    collection = _get_collection()
    results = collection.query(
        query_texts=[question],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    docs = []
    if results and results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i] if results["metadatas"] else {}
            distance = results["distances"][0][i] if results["distances"] else 0
            docs.append({
                "text": doc,
                "doc_name": meta.get("doc_name", "Unknown"),
                "doc_id": meta.get("doc_id", ""),
                "chunk_index": meta.get("chunk_index", 0),
                "score": round(1 - distance, 4),
            })
    return docs


def list_documents() -> list[dict]:
    collection = _get_collection()
    all_data = collection.get(include=["metadatas"])
    doc_map = {}
    if all_data and all_data["metadatas"]:
        for meta in all_data["metadatas"]:
            doc_id = meta.get("doc_id", "")
            if doc_id and doc_id not in doc_map:
                doc_map[doc_id] = {
                    "doc_id": doc_id,
                    "doc_name": meta.get("doc_name", "Unknown"),
                    "total_chunks": meta.get("total_chunks", 0),
                }
    return list(doc_map.values())


def delete_document(doc_id: str) -> bool:
    collection = _get_collection()
    all_data = collection.get(include=["metadatas"])
    ids_to_delete = []
    if all_data and all_data["ids"]:
        for i, meta in enumerate(all_data["metadatas"]):
            if meta.get("doc_id") == doc_id:
                ids_to_delete.append(all_data["ids"][i])

    if not ids_to_delete:
        return False

    batch_size = 100
    for i in range(0, len(ids_to_delete), batch_size):
        batch = ids_to_delete[i:i+batch_size]
        collection.delete(ids=batch)

    return True
