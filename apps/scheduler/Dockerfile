FROM python:3.12-slim

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

RUN apt-get update

WORKDIR /src

COPY requirements.txt /src/requirements.txt
RUN pip install -r requirements.txt

COPY ./src /src

CMD ["fastapi", "run", "main.py"]