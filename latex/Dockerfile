FROM pandoc/core:latest-ubuntu
ARG DEBIAN_FRONTEND=noninteractive

ENV luarocks_version 3.11.0

RUN apt-get update && apt-get install -y git make perl texlive-xetex swath luarocks

RUN luarocks install luautf8