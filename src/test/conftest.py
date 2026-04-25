import pytest
import asyncio
import os
import sys
from httpx import AsyncClient, ASGITransport

# Add the project root to sys.path so 'src' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.main import app
from src.config.database import connect_to_mongo, close_mongo_connection

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def database_lifecycle():
    """Manage database connection for the entire test session."""
    try:
        await connect_to_mongo()
        yield
    finally:
        await close_mongo_connection()

@pytest.fixture
async def client():
    """Provide a test client for the FastAPI application."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
