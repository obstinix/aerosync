FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 9002
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9002"]
