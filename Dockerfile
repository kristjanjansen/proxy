FROM node:21
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y chromium
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 8080
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_ARGS='--no-sandbox'
CMD [ "node", "index.js", "8080" ]