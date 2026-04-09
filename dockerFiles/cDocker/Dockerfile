FROM gcc:latest

WORKDIR /usr/src/app

# Default command to compile and run C code
CMD ["sh", "-c", "gcc user_code.c -o program && ./program < input.txt"]