FROM python:3.12-slim

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

RUN apt-get update

WORKDIR /src

RUN addgroup -S lems && adduser -S backend -G lems

ARG MONGO_CA_CERTIFICATE
ENV MONGO_CA_CERTIFICATE=$MONGO_CA_CERTIFICATE
RUN echo $MONGO_CA_CERTIFICATE > /root/mongo-ca-certificate.crt
RUN chown scheduler:lems /root/mongo-ca-certificate.crt

COPY requirements.txt /src/requirements.txt
RUN pip install -r requirements.txt

COPY ./src /src

USER scheduler

CMD ["fastapi", "run", "main.py"]