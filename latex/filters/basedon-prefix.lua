-- local logging = require 'logging'
function basedon_prefix(m)
    -- logging.temp('m', m.chapter.basedon)
    if m.chapter.basedon ~= nil then
        if string.match(pandoc.utils.stringify(m.chapter.basedon), "^%d") then
            table.insert(m.chapter.basedon, 1, pandoc.Str(' '))
        end
        table.insert(m.chapter.basedon, 1, pandoc.Str('ศึกษาควบคู่กับ'))
    end
    return m
end

return {{
    Meta = basedon_prefix
}}
