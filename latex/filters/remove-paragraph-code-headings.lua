function Header(el)
    if el.level == 2 then
        local content_str = pandoc.utils.stringify(el.content)
        if string.match(content_str, '{') then
            return {}
        end
    end
end
