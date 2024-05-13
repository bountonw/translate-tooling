function Emph(el)
    local newContent = el.content
    table.insert(newContent, 1, pandoc.Str(' '));
    table.insert(newContent, pandoc.Str(' '));
    return pandoc.Emph(newContent)
end
