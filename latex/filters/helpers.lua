-- local logging = require 'logging'
local utf8 = require 'lua-utf8'
local helpers = {}

function helpers.read_file_lines(path)
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

function helpers.read_and_sort_file_lines(path)
    local words = helpers.read_file_lines(path)
    if words ~= nil then
        table.sort(words, function(a, b)
            return utf8.len(a) > utf8.len(b)
        end)
    end
    return words
end

function helpers.style_special_words(text, words, style, is_bold)
    local t = {text}
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
                    local wordTruncationOffset = (utf8.len(word) > 3 and word ~= '. . .' and
                                                     string.len(utf8.sub(word, -2)) or 0)
                    local new_string = pandoc.Span(string.sub(textOrEl, wordIndex,
                        wordIndex + #word - 1 - wordTruncationOffset), {
                        ["custom-style"] = style
                    })
                    if is_bold then
                        new_string = pandoc.Strong(new_string)
                    end
                    table.insert(t, insertIndex, new_string)
                    if #textOrEl > wordIndex + #word - wordTruncationOffset then
                        table.insert(t, insertIndex + 1, string.sub(textOrEl, wordIndex + #word - wordTruncationOffset))
                    end
                    table.remove(t, i)
                end
            end
        end
    end
    -- logging.temp('total', t)
    return t
end

return helpers
