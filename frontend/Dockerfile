# Use an official Node runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if used)
# Copying these first leverages Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source inside the image
COPY . .

# Expose the Vite development port
EXPOSE 5173

# Command to run the development server
# --host 0.0.0.0 makes it accessible from outside the container (via port mapping)
CMD ["npm", "run", "dev"] 