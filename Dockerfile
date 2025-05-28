# WIP
# 4 critical vulnerabilities in node:latest (2025-05-28, but i'm using it anyway)
FROM node:latest

# Copy files
RUN mkdir /app
COPY . /app
WORKDIR /app

# CMD npm run start
CMD sleep infinity