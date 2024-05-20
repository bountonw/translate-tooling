traverse = 'topdown'

local helpers = require "filters/helpers"

local words = helpers.read_and_sort_file_lines('./dictionaries/forbidden-breaks')

function Str(el)
    return helpers.style_special_words(el.text, words, 'Forbidden Break', false), false
end
