FROM node:18

WORKDIR /usr/src/app

RUN npm install -g typescript

CMD ["sh", "-c", "tsc user_code.ts && node user_code.js < input.txt"]