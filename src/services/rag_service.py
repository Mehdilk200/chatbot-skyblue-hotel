import chromadb
from langchain_chroma import Chroma
from typing import List
from chromadb.utils import embedding_functions

class ChromaDefaultEmbeddings:
    def __init__(self):
        self.ef = embedding_functions.DefaultEmbeddingFunction()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.ef(texts)

    def embed_query(self, text: str) -> List[float]:
        return self.ef([text])[0]

class RAGService:
    def __init__(self):
        # We'll use a local chromadb directory
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.embeddings = ChromaDefaultEmbeddings()
        self.collection_name = "hotel_rooms"
        self.vector_store = Chroma(
            client=self.chroma_client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
        )

    def add_room_to_knowledge_base(self, room_id: str, room_number: str, description: str, characteristics: List[str]):
        """Adds or updates a room in the vector knowledge base."""
        # Create a rich text document for embedding
        document = f"Room Number: {room_number}\nDescription: {description}\nCharacteristics/Amenities: {', '.join(characteristics)}"
        
        try:
            self.vector_store.delete(ids=[room_id])
        except Exception:
            pass # Id doesn't exist yet

        self.vector_store.add_texts(
            texts=[document],
            metadatas=[{"room_number": room_number, "room_id": room_id}],
            ids=[room_id]
        )

    def query_hotel_knowledge(self, query: str) -> str:
        """Search the knowledge base for rooms matching the query."""
        results = self.vector_store.similarity_search(query, k=3)
        if not results:
            return "No matching rooms found in the knowledge base."
        
        response = "Here are the matching room details:\n"
        for i, res in enumerate(results):
            response += f"{i+1}. {res.page_content}\n"
        return response

rag_service = RAGService()
