"""
VartaSync — Database Models (SQLAlchemy + SQLite)
==================================================
Three lightweight tables: Leads, Calls, Transcripts.
No Prisma. No Postgres. Just what the demo needs.
"""

import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime,
    ForeignKey, Enum as SQLEnum, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker as async_sessionmaker

from app.constants import LeadCategory, Language

Base = declarative_base()


class Lead(Base):
    """A partner lead in the Rupeezy AP program pipeline."""
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    language = Column(SQLEnum(Language), default=Language.HINDI)
    status = Column(SQLEnum(LeadCategory), default=LeadCategory.COLD)
    score = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    calls = relationship("Call", back_populates="lead", cascade="all, delete-orphan")


class Call(Base):
    """A single call session with a lead."""
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    final_score = Column(Integer, default=30)
    category = Column(SQLEnum(LeadCategory), default=LeadCategory.COLD)
    summary = Column(Text, nullable=True)  # JSON string of the post-call summary
    objections_raised = Column(Text, default="[]")  # JSON list of objection IDs
    next_action = Column(String(255), nullable=True)

    # Relationships
    lead = relationship("Lead", back_populates="calls")
    transcripts = relationship("Transcript", back_populates="call", cascade="all, delete-orphan")


class Transcript(Base):
    """Individual transcript entries within a call."""
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    speaker = Column(String(10), nullable=False)  # "user" or "agent"
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    call = relationship("Call", back_populates="transcripts")


# ============================================================================
# Database initialization
# ============================================================================

def get_sync_engine(database_url: str = "sqlite:///./vartasync.db"):
    """Create a synchronous engine (for initial table creation)."""
    return create_engine(database_url.replace("+aiosqlite", ""))


def init_db(database_url: str = "sqlite:///./vartasync.db"):
    """Create all tables synchronously (run once on startup)."""
    engine = get_sync_engine(database_url)
    Base.metadata.create_all(engine)
    return engine


def get_sync_session(database_url: str = "sqlite:///./vartasync.db"):
    """Get a synchronous session factory for simple operations."""
    engine = get_sync_engine(database_url)
    Session = sessionmaker(bind=engine)
    return Session()
