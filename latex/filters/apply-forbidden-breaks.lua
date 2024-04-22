-- local logging = require 'logging'

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

traverse = 'topdown'

function Str (el)
    local words = read_file_lines('./dictionaries/forbidden-breaks')

    local t = {el.text}
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