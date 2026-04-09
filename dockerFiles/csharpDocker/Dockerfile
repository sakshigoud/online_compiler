FROM mcr.microsoft.com/dotnet/sdk:7.0

WORKDIR /usr/src/app

CMD ["sh", "-c", "tmpdir=$(mktemp -d) && dotnet new console -o \"$tmpdir\" --force >/dev/null && cp user_code.cs \"$tmpdir/Program.cs\" && cd \"$tmpdir\" && dotnet run < /usr/src/app/input.txt"]