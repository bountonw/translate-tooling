function Str(el)
    if string.match(el.text, '…') then
        return pandoc.Str(string.gsub(el.text, "…", " . . . "))
    end
end
