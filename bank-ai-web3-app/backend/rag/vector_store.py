# backend/rag/vector_store.py
import chromadb
from chromadb.config import Settings
import os
import hashlib

class VectorStore:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        self.collection = self.client.get_or_create_collection(
            name="banking_knowledge",
            metadata={"description": "bank knowledge base"}
        )
    
    def add_documents(self, documents, metadatas=None, ids=None):
        if not ids:
            ids = [f"doc_{hashlib.md5(doc.encode()).hexdigest()[:8]}" for doc in documents]
        
        if not metadatas:
            metadatas = [{"source": "banking_knowledge"} for _ in documents]
        
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        return ids
    
    def search(self, query, n_results=3):
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        return {
            "documents": results["documents"][0] if results["documents"] else [],
            "metadatas": results["metadatas"][0] if results["metadatas"] else [],
            "distances": results["distances"][0] if results["distances"] else []
        }
    
    def get_count(self):
        return self.collection.count()
    
    def clear(self):
        self.client.delete_collection("banking_knowledge")
        self.collection = self.client.get_or_create_collection(
            name="banking_knowledge",
            metadata={"description": "bank knowledge base"}
        )