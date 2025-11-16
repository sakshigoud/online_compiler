# Use Alpine Linux with GCC for minimal size
FROM alpine:latest

# Install g++ and required runtime libraries, then clean up
RUN apk add --no-cache g++ libstdc++ && \
    rm -rf /var/cache/apk/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Set the default command to compile the C++ code and execute it
CMD ["sh", "-c", "g++ -o output user_code.cpp && ./output < input.txt"]
