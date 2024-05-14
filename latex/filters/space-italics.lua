function Emph(el)
    local space = ' ';
    return {pandoc.Str(space), el, pandoc.Str(space)}
end
