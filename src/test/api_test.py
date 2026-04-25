import pytest
import uuid
from datetime import date, timedelta

@pytest.fixture
async def auth_headers(client):
    """Fixture to provide authentication headers for protected routes."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    
    # Signup
    signup_data = {
        "email": email,
        "first_name": "Test",
        "last_name": "User",
        "password": password
    }
    await client.post("/auth/signup", json=signup_data)
    
    # Login
    login_data = {"username": email, "password": password}
    response = await client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_read_root(client):
    """Test the root endpoint."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to SkyBlue Hotel Operations API"}

@pytest.mark.asyncio
async def test_auth_flow(client):
    """Test signup, login, and protected 'me' endpoint."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    
    # 1. Signup
    signup_data = {
        "email": email,
        "first_name": "Test",
        "last_name": "User",
        "password": password
    }
    response = await client.post("/auth/signup", json=signup_data)
    assert response.status_code == 201
    assert "access_token" in response.json()
    
    # 2. Login
    login_data = {"username": email, "password": password}
    response = await client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # 3. Get Me
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == email

@pytest.mark.asyncio
async def test_hotel_operations(client, auth_headers):
    """Test floor, category, and room creation/retrieval."""
    # 1. Create Floor
    floor_data = {"number": 1, "description": "First Floor"}
    response = await client.post("/hotel/floors", json=floor_data, headers=auth_headers)
    assert response.status_code == 201
    floor_id = response.json()["_id"]
    
    # 2. Create Category
    cat_data = {"name": "Standard", "base_price": 100.0, "capacity": 2}
    response = await client.post("/hotel/categories", json=cat_data, headers=auth_headers)
    assert response.status_code == 201
    cat_id = response.json()["_id"]
    
    # 3. Create Room
    room_data = {"number": f"R-{uuid.uuid4().hex[:4]}", "floor_id": floor_id, "category_id": cat_id, "status": "available"}
    response = await client.post("/hotel/rooms", json=room_data, headers=auth_headers)
    assert response.status_code == 201
    
    # 4. Get Rooms
    response = await client.get("/hotel/rooms", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

@pytest.mark.asyncio
async def test_reservations(client, auth_headers):
    """Test reservation creation and listing."""
    # Setup: need a floor, category, and room
    floor = (await client.post("/hotel/floors", json={"number": 2}, headers=auth_headers)).json()
    cat = (await client.post("/hotel/categories", json={"name": "Deluxe", "base_price": 150, "capacity": 2}, headers=auth_headers)).json()
    room = (await client.post("/hotel/rooms", json={"number": f"D-{uuid.uuid4().hex[:4]}", "floor_id": floor["_id"], "category_id": cat["_id"]}, headers=auth_headers)).json()
    
    user_info = (await client.get("/auth/me", headers=auth_headers)).json()
    user_id = user_info["id"] 
    
    # Create Reservation
    today = date.today()
    res_data = {
        "client_id": user_id,
        "room_id": room["_id"],
        "date_start": str(today),
        "date_end": str(today + timedelta(days=2)),
        "status": "confirmed"
    }
    response = await client.post("/reservations", json=res_data, headers=auth_headers)
    assert response.status_code == 201
    
    # List Reservations
    response = await client.get("/reservations", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

@pytest.mark.asyncio
async def test_conversation_chat(client):
    """Test the AI chatbot chat endpoint."""
    chat_data = {"message": "Hello, I'd like to know about available rooms.", "sessionId": "test-session"}
    response = await client.post("/conversations/chat", json=chat_data)
    assert response.status_code == 200
    assert "reply" in response.json()
