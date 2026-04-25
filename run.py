import sys
import os
import uvicorn

# Add the project root (current directory) to the Python path
# This allows 'from src.config.database import ...' to work
root_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root_dir)

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=2330, reload=True)
