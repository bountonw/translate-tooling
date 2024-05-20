local utf8 = require 'lua-utf8'

-- The Unicode character \u200a apparently isn't in the Lua space character class (%s)
function Str(el)
    return pandoc.Str(utf8.gsub(utf8.gsub(utf8.gsub(el.text, "  ", " "), "  ", " "), "%s+", " "))
end
