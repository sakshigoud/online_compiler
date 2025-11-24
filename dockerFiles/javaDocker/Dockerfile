# Stage 1: Build the Java application
FROM openjdk:26-ea-slim AS builder

# Set the working directory
WORKDIR /usr/src/app

# Stage 2: Create a minimal runtime image
FROM openjdk:26-ea-slim

# Set the working directory
WORKDIR /usr/src/app

# Command to compile and run the Java program
CMD ["sh", "-c", "javac user_code.java && java user_code < input.txt"]