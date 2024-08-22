import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# if development, uncomment this part
# load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

SQLALCHEMY_DATABASE_URL = (
    os.environ.get("SUPABASE_DATABASE_URL")
    or "postgresql://postgres:password@localhost/postgres"
)

print(f"Used database url: {SQLALCHEMY_DATABASE_URL}")
print("If an error occured, make sure the database url set is correct")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
