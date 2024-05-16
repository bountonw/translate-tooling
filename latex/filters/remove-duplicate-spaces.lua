-- The Unicode character \u200a apparently isn't in the Lua space character class (%s)
function Str(el)
    return pandoc.Str(string.gsub(string.gsub(string.gsub(el.text, "  ", " "), "  ", " "), "%s+", " "))
end
