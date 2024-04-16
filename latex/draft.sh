#!/usr/bin/env bash

(cd ../../ && find . -path "*/$1/02_edit/*" -or -path "*/$1/03_public/*" -not -path "*/.tooling/*" -name "*.md") | while read LINE;
do
    f="$(echo $LINE | cut -c 3-)"
    if [[ "$f" == *".md" ]];then
        echo $f
        make draft/${f%.*}.pdf
    fi
done
