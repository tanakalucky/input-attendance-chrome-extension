FROM node:22-slim

RUN apt-get update && \
    apt-get install -y git vim zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm update -g npm
