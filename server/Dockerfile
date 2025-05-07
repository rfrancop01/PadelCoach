FROM python:3.13.3-alpine

WORKDIR /app

COPY . .

RUN apk add --no-cache gcc musl-dev libffi-dev \
    && pip install --upgrade pip \
    && pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "run.py"]