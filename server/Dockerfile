FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libffi-dev \
       libssl-dev \
       pkg-config \
       gfortran \
       libblas-dev \
       liblapack-dev \
       cython3 \
       python3-dev \
    && rm -rf /var/lib/apt/lists/*

ENV CXXFLAGS="-std=c++17"

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "run.py"]