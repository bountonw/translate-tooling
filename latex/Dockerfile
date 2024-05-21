FROM pandoc/core:latest-ubuntu
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y curl git make perl texlive-xetex swath lua5.4 liblua5.4-dev libpcre3-dev cmake

RUN <<EOF
curl -fsSL -o luarocks-3.11.0.tar.gz https://luarocks.org/releases/luarocks-3.11.0.tar.gz
tar zxpf luarocks-3.11.0.tar.gz
cd luarocks-3.11.0
./configure && make && make install
luarocks install luautf8
EOF
