const fs = require('fs');
let content = fs.readFileSync('../js/components.js', 'utf8');

if (!content.includes('import { isFavorite }')) {
    content = 'import { isFavorite } from \'./storage.js\';\n' + content;
}

// 2. Helper to replace likes count
content = content.replace(/124 interessados/g, '${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)} interessados');
content = content.replace(/124 pessoas vão/g, '${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)} pessoas vão');
content = content.replace(/\$\{event\.likes \|\| 124\}/g, '${(event.likesCount || event.likes || 124) + (isFavorite(event.id) ? 1 : 0)}');
content = content.replace(/\$\{event\.likesCount \|\| 124\}/g, '${(event.likesCount || 124) + (isFavorite(event.id) ? 1 : 0)}');

// 3. Heart Buttons (all components with aria-label="Salvar evento" except modal)
content = content.replace(
    /<button class="([^"h]*?)hover:text-red-500([^"]*?)" aria-label="Salvar evento" onclick="event\.stopPropagation\(\)">[\s\S]*?<i class="ph ph-heart([^"]*?)"><\/i>[\s\S]*?<\/button>/g,
    `<button class="$1hover:text-red-500$2 js-like-btn" data-event-id="\${event.id}" aria-label="Salvar evento" onclick="event.stopPropagation()">\n        <i class="\${isFavorite(event.id) ? 'ph-fill text-red-500' : 'ph text-slate-400'} ph-heart$3 transition-colors pointer-events-none"></i>\n    </button>`
);

// 4. Modal specific heart button
content = content.replace(
    /<button class="([^"w]*?)w-10 h-10 rounded-full bg-black\/30 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 hover:bg-black\/50 transition-colors">\s*<i class="ph ph-heart text-xl"><\/i>\s*<\/button>/g,
    `<button class="$1w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 hover:bg-black/50 transition-colors js-like-btn" data-event-id="\${event.id}">\n                <i class="\${isFavorite(event.id) ? 'ph-fill text-red-500' : 'ph text-white'} ph-heart text-xl transition-colors pointer-events-none"></i>\n            </button>`
);

fs.writeFileSync('../js/components.js', content);
console.log('components updated');
