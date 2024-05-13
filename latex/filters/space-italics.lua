function Emph(el)
    local space = ' ';
    local newContent = el.content
    table.insert(newContent, 1, pandoc.Str(space));
    table.insert(newContent, pandoc.Str(space));
    return pandoc.Emph(newContent)
end
