# Stage 1: Build the Python application
FROM python:3.11-slim AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy the user's Python files into the container
COPY . .

# Stage 2: Create a minimal runtime image
FROM python:3.11-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the Python files and installed packages from the builder stage
COPY --from=builder /usr/src/app .

# Command to run the Python program
CMD ["sh", "-c", "cat input.txt | python user_code.py"]


