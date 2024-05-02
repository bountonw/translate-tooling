-- local logging = require 'logging'
function Inlines(inlines)
    local new_inlines = {}
    local current_string = ""

    -- logging.temp('inlines', inlines)
    for i = 1, #inlines do
        if inlines[i].t == "Str" then
            current_string = current_string .. inlines[i].text
        elseif inlines[i].t == "Space" or inlines[i].t == "SoftBreak" then
            current_string = current_string .. " "
        else
            if current_string then
                table.insert(new_inlines, pandoc.Str(current_string))
                current_string = ""
            end
            table.insert(new_inlines, inlines[i])
        end
    end
    if current_string then
        table.insert(new_inlines, pandoc.Str(current_string))
    end

    -- logging.temp('new_inlines', new_inlines)
    return new_inlines
end
