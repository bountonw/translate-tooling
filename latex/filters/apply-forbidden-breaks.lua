-- local logging = require 'logging'
traverse = 'topdown'

local function read_file_lines(path)
    local file = io.open(path, "rb")
    if not file then
        return nil
    end

    local lines = {}

    for line in io.lines(path) do
        table.insert(lines, line)
    end

    file:close()
    return lines
end

local words = read_file_lines('./dictionaries/forbidden-breaks')
table.sort(words, function(a, b)
    return utf8.len(a) > utf8.len(b)
end)

function Str(el)
    local t = {el.text}
    -- logging.temp('text', el.text)
    for w = 1, #words, 1 do
        local word = words[w]
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
                    -- logging.temp('len', utf8.len(word), string.len(word), word)
                    local wordTruncationOffset = (utf8.len(word) > 3 and 6 or 0)
                    table.insert(t, insertIndex,
                        pandoc.Span(string.sub(textOrEl, wordIndex, wordIndex + #word - 1 - wordTruncationOffset), {
                            ["custom-style"] = 'Forbidden Break'
                        }))
                    if #textOrEl > wordIndex + #word - 6 then
                        table.insert(t, insertIndex + 1, string.sub(textOrEl, wordIndex + #word - wordTruncationOffset))
                    end
                    table.remove(t, i)
                end
            end
        end
    end
    -- logging.temp('total', t)

    return t, false
end
