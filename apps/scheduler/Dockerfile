FROM python:3.12-slim

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

RUN apt-get update

WORKDIR /src

ARG MONGO_CA_CERTIFICATE
ENV PYTHON_ENV=production
ENV MONGO_CA_CERTIFICATE=$MONGO_CA_CERTIFICATE
RUN echo $MONGO_CA_CERTIFICATE > /root/mongo-ca-certificate.crt

COPY requirements.txt /src/requirements.txt
RUN pip install -r requirements.txt

COPY ./src /src

CMD ["fastapi", "run", "main.py"]