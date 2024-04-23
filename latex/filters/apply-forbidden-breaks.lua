-- local logging = require 'logging'

traverse = 'topdown'

function read_file_lines(path)
    local file = io.open(path, "rb")
    if not file then return nil end

    local lines = {}

    for line in io.lines(path) do
        table.insert(lines, line)
    end

    file:close()
    return lines
end

local words = read_file_lines('./dictionaries/forbidden-breaks')

function Inlines (inlines)
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

function Str (el)
    local t = {el.text}
    -- logging.temp('text', el.text)
    for w = #words, 1, -1 do
        word = words[w]
        for i, textOrEl in ipairs(t) do
            -- logging.temp('text', textOrEl, word)
            if type(textOrEl) == "string" then
                local wordIndex = string.find(textOrEl, word)
                if wordIndex ~= nil then
                    local insertIndex = i + 1
                    -- logging.temp('insert', wordIndex, insertIndex)
                    if wordIndex > 1 then
                        table.insert(t, insertIndex, string.sub(textOrEl, 1, wordIndex - 1))
                        insertIndex = insertIndex + 1
                    end
                    table.insert(t, insertIndex, pandoc.Span(string.sub(textOrEl, wordIndex, wordIndex + #word - 1), { ["custom-style"] = 'Forbidden Break'}))
                    if #textOrEl > wordIndex + #word then
                        table.insert(t, insertIndex + 1, string.sub(textOrEl, wordIndex + #word))
                        insertIndex = insertIndex + 1
                    end
                    table.remove(t, i)
                    i = insertIndex - 1
                end
            end
        end
    end
    -- logging.temp('total', t)

    return t, false
end
