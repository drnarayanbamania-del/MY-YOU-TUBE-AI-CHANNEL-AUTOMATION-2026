# Use Node.js 20 base image
FROM node:20

# Install FFmpeg at OS level for maximum stability
RUN apt-get update && apt-get install -y ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose the server port
EXPOSE 3000

# Start it up
CMD [ "npm", "start" ]
