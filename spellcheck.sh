# cat ../th/LBF/03_public/LBF16_th.md \
find ../th/LBF/03_public/. -type f -exec cat {} \; \
| sed '/^---$/,/^...$/d' \
| pandoc --from markdown_strict --to plain \
    --lua-filter ./latex/filters/stitch-adjacent-strings.lua \
    --lua-filter ./latex/filters/remove-paragraph-code-headings.lua \
> source.txt
# | swath -b "|" -u u,u -m max -d ./swathdic.tri \
attacut-cli source.txt --dest cut.txt
cat cut.txt \
| sed 's/ /\n/g' \
| sed 's/|/\n/g' \
> words.txt