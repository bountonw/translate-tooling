#!/usr/bin/env bash

(cd ../../ && find . -path "*/$1/03_public/*" -name "*.md") | while read LINE;
do
    f="$(echo $LINE | cut -c 3-)"
    if [[ "$f" == *".md" ]];then
        echo $f
        make icml/${f%.*}.icml
    fi
done
