FROM python:3.12-slim

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ARG PG_HOST
ARG PG_PORT
ARG PG_USER
ARG PG_PASSWORD
ARG DB_NAME
ENV PG_HOST=$PG_HOST
ENV PG_PORT=$PG_PORT
ENV PG_USER=$PG_USER
ENV PG_PASSWORD=$PG_PASSWORD
ENV DB_NAME=$DB_NAME

RUN apt-get update

WORKDIR /src

COPY requirements.txt /src/requirements.txt
RUN pip install -r requirements.txt

COPY ./src /src

CMD ["fastapi", "run", "main.py"]