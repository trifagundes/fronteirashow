const fs = require('fs');
let content = fs.readFileSync('../js/components.js', 'utf8');

// 1. interessados
content = content.replace(
    /\$\{\(event\.likesCount \|\| 124\) \+ \(isFavorite\(event\.id\) \? 1 : 0\)\} interessados/g, 
    '<span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="interessados">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)} interessados</span>'
);

// 2. pessoas vão (using both encodings just in case)
content = content.replace(
    /\$\{\(event\.likesCount \|\| 124\) \+ \(isFavorite\(event\.id\) \? 1 : 0\)\} pessoas v[ã]o/g, 
    '<span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="pessoas_vao">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)} pessoas vão</span>'
);

// 3. Modal strong tag
content = content.replace(
    /<strong class="text-slate-800 dark:text-slate-100">\$\{\(event\.likesCount \|\| event\.likes \|\| 124\) \+ \(isFavorite\(event\.id\) \? 1 : 0\)\}<\/strong>/g, 
    '<strong class="text-slate-800 dark:text-slate-100 js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || event.likes || 124}" data-format="numero">${(event.likesCount || event.likes || 124) + (isFavorite(event.id) ? 1 : 0)}</strong>'
);

// 4. Naked numbers next to mr-0.5 icon
content = content.replace(
    /mr-0\.5">\s*\$\{\(event\.likesCount \|\| 124\) \+ \(isFavorite\(event\.id\) \? 1 : 0\)\}\s*<\/span>/g, 
    'mr-0.5 js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="numero">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)}</span>'
);

// 5. Naked numbers inside font-bold text-orange-500
content = content.replace(
    /font-bold">\$\{\(event\.likesCount \|\| event\.likes \|\| 124\) \+ \(isFavorite\(event\.id\) \? 1 : 0\)\}<\/span>/g, 
    'font-bold js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || event.likes || 124}" data-format="numero">${(event.likesCount || event.likes || 124) + (isFavorite(event.id) ? 1 : 0)}</span>'
);

// 6. Naked numbers next to </i>
content = content.replace(
    /ph-fire"><\/i> \$\{\(event\.likesCount \|\| 124\) \+ \(isFavorite\(event\.id\) \? 1 : 0\)\}/g, 
    'ph-fire"></i> <span class="js-likes-count" data-event-id="${event.id}" data-base-likes="${event.likesCount || 124}" data-format="numero">${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)}</span>'
);

fs.writeFileSync('../js/components.js', content);
console.log('done updating components.js with js-likes-count');
