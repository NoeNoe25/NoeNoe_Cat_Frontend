# # ===== Stage 1: Builder =====
# FROM python:3.12-slim AS builder

# # Set working directory
# WORKDIR /app

# # Copy requirements first for better build caching
# COPY requirements.txt ./

# # Install Python dependencies into /install (not global)
# RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# # ===== Stage 2: Runtime =====
# FROM python:3.12-slim

# # Set working directory
# WORKDIR /app

# # Copy installed dependencies from builder
# COPY --from=builder /install /usr/local

# # Copy both websocket app directories while keeping their structure
# COPY vosk_websocket/ ./vosk_websocket/
# COPY gemini_websocket/ ./gemini_websocket/
# COPY fastapi_database/ ./fastapi_database/

# # Optionally copy any shared files (like configs)
# # COPY config.yaml ./

# # Expose ports (vosk=2700, gemini=8765, fastapi=8008)
# EXPOSE 2700
# EXPOSE 8765
# EXPOSE 8008

# # Default command (you can override in docker-compose)
# # CMD ["bash", "-c", "python vosk_websocket/app.py & python gemini_websocket/app.py & uvicorn fastapi.app:app --host 0.0.0.0 --port 8008"]
# CMD ["bash", "-c", "python vosk_websocket/app.py & python gemini_websocket/app.py & uvicorn fastapi_database.app:app --host 0.0.0.0 --port 8008"]

# ===== Stage 1: Builder =====
FROM python:3.12-slim AS builder

# Set working directory
WORKDIR /app

# Copy requirements first for better build caching
COPY requirements.txt ./

# Install Python dependencies into /install (not global)
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# ===== Stage 2: Runtime =====
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /install /usr/local

# Copy application files
COPY . .

# Expose ports (vosk=2700, gemini=8765, fastapi=8000)
EXPOSE 2700
EXPOSE 8765
EXPOSE 8008

# Start only FastAPI - it will start the WebSocket servers automatically
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8008"]