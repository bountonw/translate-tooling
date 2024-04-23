-- local logging = require 'logging'

function Str (el)
    -- logging.temp(el.text)
    if string.match(el.text, '%s*{%a+ %d+%.%d+}') then
        -- logging.temp('match')
        return pandoc.Str(string.gsub(el.text, "%s*%{%a+ %d+%.%d+%}", ""))
    end
end
