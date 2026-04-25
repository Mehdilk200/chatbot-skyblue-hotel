from langchain_community.tools import DuckDuckGoSearchRun, DuckDuckGoSearchResults
from langchain_core.tools import tool

@tool
def web_search(query: str):
    """
    Search the web for real-time information about hotel-related topics, 
    local events, weather, or general knowledge. 
    Use this when user asks about things outside the hotel's static knowledge.
    """
    search = DuckDuckGoSearchRun()
    return search.run(query)

@tool
def image_search(query: str):
    """
    Search for images related to the query. 
    Useful for showing hotel rooms, local attractions, or amenities.
    Returns snippets containing image links.
    """
    search = DuckDuckGoSearchResults(backend="images", num_results=3)
    return search.run(query)

@tool
def hotel_knowledge_search(query: str):
    """
    Search the hotel's knowledge base for room types, descriptions, characteristics, and amenities.
    Use this to find rooms that match the user's requirements (e.g., 'sea view', 'balcony', 'large bed').
    """
    from src.services.rag_service import rag_service
    return rag_service.query_hotel_knowledge(query)

# Bundle tools for the orchestrator
mcp_tools = [web_search, image_search, hotel_knowledge_search]
