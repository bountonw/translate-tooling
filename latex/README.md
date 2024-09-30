# Latex-based Tooling

Someday document all the things...

## `LUA_CPATH`

You must have the `lua-utf8` module in your `LUA_CPATH`. Use something like the following command:

```
export LUA_CPATH="./?.so;/usr/local/lib/lua/5.4/?.so;/usr/local/share/lua/5.4/?.so;/opt/homebrew/lib/lua/5.4/?.so"
```

## Docker Image

The Docker-based workflows use a custom Docker image built from the Dockerfile in this repo. This image can be build and updated with the following commands:

```
docker build -t mattleff/xelatex-swath .
docker push mattleff/xelatex-swath
```