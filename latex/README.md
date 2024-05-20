# Latex-based Tooling

Someday document all the things...

## Docker Image

The Docker-based workflows use a custom Docker image built from the Dockerfile in this repo. This image can be build and updated with the following commands:

```
docker build -t mattleff/xelatex-swath .
docker push mattleff/xelatex-swath
```