$if(titleblock)$
$titleblock$

$endif$
$for(header-includes)$
$header-includes$

$endfor$
$for(include-before)$
$include-before$

$endfor$
$if(toc)$
$toc$

$endif$

$if(chapter.title.th)$
# $chapter.title.th$
$else$
# $chapter.title.en$
$endif$

$if(chapter.basedon)$<span class="basedon">ศึกษาควบคู่กับ$chapter.basedon$</span>$endif$

$body$
$for(include-after)$

$include-after$
$endfor$