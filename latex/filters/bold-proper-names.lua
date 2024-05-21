traverse = 'topdown'

local helpers = require "filters/helpers"

local words = {}

local function get_words()
    local names_path = PANDOC_STATE['input_files'][1]:match("./preprocessed/(.*[/\\]).*[/\\]")
    local words_path = '../../' .. names_path .. '/proper-names.txt'
    local maybe_words = helpers.read_and_sort_file_lines(words_path)
    if maybe_words ~= nil then
        words = maybe_words
    end
end

local function bold_names(el)
    return helpers.style_special_words(el.text, words, 'Forbidden Break', true), false
end

return {{
    Meta = get_words
}, {
    Str = bold_names
}}
